const express = require('express')
const app = express()
const port = 8080
msg = "<h1>IKEA Tweets</h1></br><h3><a href='/'>click here to refresh!</a></h3>";

//=================== big query ==========================

function main(
  datasetId = 'Ikea_tweets', // Existing dataset
  tableId = 'my_test_table' // Table to create
) {
  // [START bigquery_browse_table]
  // Import the Google Cloud client library using default credentials
  msg = "<h1>IKEA Tweets</h1></br><h3><a href='/'>click here to refresh!</a></h3>";
  const {BigQuery, Table} = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();
  //Troubleshooting the issue with the doublicate table
  try {
    dataset.table(tableId).get();
    console.log(`Table ${tableId} exists.`);
    bigquery.dataset(datasetId).table(tableId).delete();
    console.log(`Table ${tableId} deleted.`);
  } catch (e) {
    console.log("Everything is cool");
  }

  // Create table reference.
  const dataset = bigquery.dataset(datasetId);
  const destinationTable = dataset.table(tableId);

  async function browseTable() {
    // Retrieve a table's rows using manual pagination.

    const query = `SELECT *
      FROM \`Ikea_tweets.Ikea_hackdays_tb\`
      ORDER BY date
      DESC LIMIT 20`;
  

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
        //console.log(`name: ${row.user_name}, ${row.text} total people`); //For logs
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
  bigquery.dataset(datasetId).table(tableId).delete();
  // [END bigquery_browse_table]
}

//=================== Express.js ==========================

app.get('/', (req, res) => {
  main(...process.argv.slice(2));
  res.write('');
      setInterval(function() {
          res.end(msg);
      },7000);
  //res.send(msg)
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});