# TODOS


## Error Handling Expansion
* Several Paths in UI and on worker are lacking in proper handling
* Add Error Boundary

## DB Migrations
* Locally (write cmd line automation that will loop over migrations): wrangler d1 execute DB --local --file functions/src/db/migrations/0001_tired_sally_floyd.sql 
* Migrations are so bad on D1 - they will cause temporary outages (currently)

