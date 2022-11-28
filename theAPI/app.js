const express = require('express')
const app = express()
const port = 8080
msg = "<h1>IKEA Tweets</h1></br><h3><a href='/'>click here to refresh!</a></h3>";
tablename = 'tmp_table'
timenum = Math.floor(Date.now() / 1000)

//generates a random number
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

//=================== big query ==========================

function main(
  datasetId = 'Ikea_tweets', // Existing dataset
  tableId = tablename + timenum + getRandomInt(100000).toString() // Table to create
) {
  // [START bigquery_browse_table]
  // Import the Google Cloud client library using default credentials
  msg = "<h1>IKEA Tweets</h1></br><h3><a href='/'>click here to refresh!</a></h3>";
  console.log(`The tableid is ${tableId}`)
  const {BigQuery, Table} = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();
  const dataset = bigquery.dataset(datasetId);
  const destinationTable = dataset.table(tableId);
  
  // Create table reference.
  //dataset.table(tablename)
  let tables = dataset.getTables();
  //console.log(tables[tableId].toString);

  async function browseTable() {
    // Retrieve a table's rows using manual pagination.

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
     // const datasetId = 'my_dataset'; // Existing dataset
     //const tableId = 'my_table'; // Table to create

    //const datasetId = 'Ikea_tweets' // Existing dataset
    //const tableId = 'my_test_table' // Table to create

    const query = `SELECT *
      FROM \`Ikea_tweets.Ikea_hackdays_tb\`
      ORDER BY date
      DESC LIMIT 20`;

    // Create table reference.
    //const dataset = bigquery.dataset(datasetId);
    //const destinationTable = dataset.table(tableId);
    //const destinationTable = await dataset.table(tableId).get({autoCreate:true});
  

    // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#jobconfigurationquery
    const queryOptions = {
      query: query,
      destination: destinationTable,
    };
    

    // Run the query as a job
    const [job] = await bigquery.createQueryJob(queryOptions);

    // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/jobs/getQueryResults
    const queryResultsOptions = {
      // Retrieve zero resulting rows.
      maxResults: 0,
    };

    // Wait for the job to finish.
    await job.getQueryResults(queryResultsOptions);

    function manualPaginationCallback(err, rows, nextQuery) {
      rows.forEach(row => {
        //console.log(`name: ${row.user_name}, ${row.text} total people`);
        msg = msg + `<b style="color:blue;">${row.user_name}:</b> ${row.text} <b>[${JSON.stringify(row.date.value)}]</b></br>`;
      });

      if (nextQuery) {
        // More results exist.
        destinationTable.getRows(nextQuery, manualPaginationCallback);
      }
    }

    // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tabledata/list
    const getRowsOptions = {
      autoPaginate: false,
      maxResults: 20,
    };

    // Retrieve all rows.
    destinationTable.getRows(getRowsOptions, manualPaginationCallback);
  }
  browseTable();
  //bigquery.dataset(datasetId).table(tablename).delete();
  // [END bigquery_browse_table]
}

//=================== Express.js ==========================

app.get('/', (req, res) => {
  try{
    main(...process.argv.slice(2));
  } catch(e) {
    console.log(`Something went wrong with BQ:${e}`)
  }
  res.write('');
      setInterval(function() {
          res.end(msg);
      },3000);
  //res.send(msg)
})

/* GET the length of the whip. */
app.post('/indiana-robertalm/switch-idol/', function(req, res, next) {
  console.log('Got volume from body:', req.body.idol_volume);
  res.json({
    "idol_weight": (req.body.idol_volume * 19.3).toFixed(3),
})
});

/* GET the length of the whip. */
app.get('/indiana-robertalm/whip-jump/', function(req, res, next) {
  let w = req.param('w');
  let h = req.param('h');
  let result = (Math.sqrt(Math.pow(h, 2) + Math.pow(w/2, 2))).toFixed(2);

  res.json({
    "whip_length": result
})
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})