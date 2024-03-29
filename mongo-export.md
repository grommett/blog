---
date: '2024-03-29'
tags:
  - 'mongodb'
  - 'mongoexport'
  - 'parallelism'
  - 'queues'
  - 'erlang'
---

# Making Mongo Exports Faster

[`mongoexport`](https://www.mongodb.com/docs/database-tools/mongoexport/) is a really great command line tool for getting your data out of a Mongo database. Recently, I was asked to export all of our application's collections as `csv` and `parquet` files. What follows is my journey to reduce the time to export by ~65% in all environments. In minutes that's a decrease from ~23m to 7mins.

## The Problem

We wanted our exports to happen twice an hour and that was easy in our `dev` and `staging` environments. In production however, we have a lot more data and often enough (not all the time) exporting in production would take more than thirty minutes so we would have overlap, not to mention extra strain on the database itself. So as a stop gap we reduced the export interval to once an hour.

## The Solution

Following the principles of

- ✅ Make it work 
- ✅ Make it right
- ✅ Make it fast

### Make It Work

In the first iteration the export job was simple and each export ran in sequence. Given a list of collections, loop through the list and run the `mongoexport` command in each iteration. This was synchronous, simple and it made book keeping and retires easy too. The problem, as mentioned above, was that it was prone to run over thirty minutes in production.

### Make It Right

My first attempt at making the export job faster was to batch collection exports four at a time. Essentially, send four collections to be exported, wait until all four collections were completed, send four more, repeat. As I was observing the logs with this approach I could see that in any given batch some collections would export fast and others would take longer. A batch was only as fast as the slowest export. This approach still reduced the time, but we can do better!

### Make It Fast 🚀

After observing the logs of the four-at-a-time approach it occurred to me that there's no reason to wait for anything other than export completion. If one export is done just send another.

After some googling I stumbled upon [Queueing theory](https://en.wikipedia.org/wiki/Queueing_theory). Thanks [Erlang](https://en.wikipedia.org/wiki/Agner_Krarup_Erlang)! There's a lot that doesn't apply here but some that does. Especially:

> An analogy often used [in queueing theory] is that of the cashier at a supermarket. Customers arrive, are processed by the cashier, and depart. Each cashier processes one customer at a time...A setting with a waiting zone for up to n customers is called a queue with a buffer of size n.

That's it. We have a waiting area of n customers (collections) waiting to be processed (exported) and we can have n number of cashiers (background process to do the export) to process them. As each customer is processed we'll send another customer to the empty cashier. With all that theory it really plays out in a while loop with background processes.

Below is a stripped down version but the logic is as follows
- Loop through each collection
- If we **haven't** reached the max number of background exports start a new one
- If we **have** reached our max number of background exports pause until one finishes

```bash
#!/usr/bin/env bash

export max_parallel_exports=4;

###
# Count of currently executing background processes
###
count_collections_exporting() {
  # Count the number of background processes
  local num_processes
  num_processes=$(jobs -p | wc -l | tr -d ' ')
  echo "$num_processes"
}

for collection in "${collections[@]}"; do
  while [ "$(count_collections_exporting)" = "$max_parallel_exports" ]; do
    wait -n ; # Wait until a background process becomes free
  done
  export_collection "$collection" & # Start exporting in a background process
done

# Wait for all customers to be checked out
wait
echo "All exports done!"
```



