(function evoTSPwrapper($) {

    // You'll need to replace this with the URL you get when you
    // deploy your API Gateway.
    const baseUrl = 'https://6jj80mdfp2.execute-api.us-east-1.amazonaws.com/prod'
    console.log(`The base URL is ${baseUrl}.`);

    // Set up the functions to be called when the user clicks on any
    // of the three buttons in our (very simple) user interface.
    // We provided `randomRoutes()` for you, but you have to implement
    // `getBestRoutes()` and `getRouteById()`.
    $(function onDocReady() {
        $('#generate-random-routes').click(randomRoutes);
        $('#get-best-routes').click(getBestRoutes);
        $('#get-route-by-id').click(getRouteById);
    });

    // This generates a single random route by POSTing the
    // runId and generation to the `/routes` endpoint.
    // It's asynchronous (like requests across the network
    // typically are), and the showRoute() function is called
    // when the request response comes in.
    function randomRoute(runId, generation) {
        $.ajax({
            method: 'POST',
            url: baseUrl + '/routes',
            data: JSON.stringify({
                runId: runId,
                generation: generation
            }),
            contentType: 'application/json',
            // When a request completes, call `showRoute()` to display the
            // route on the web page.
            success: showRoute,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error(
                    'Error generating random route: ',
                    textStatus,
                    ', Details: ',
                    errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when creating a random route:\n' + jqXHR.responseText);
            }
        })
    }

    // Generates a collection of new routes, where the number to generate
    // (and the runId and generation) are specified in the HTML text
    // fields. Note that we don't do any kind of sanity checking here, when
    // it would make sense to at least ensure that `numToGenerate` is a
    // non-negative number.
    //
    // This uses the `async` library (https://caolan.github.io/async/v3/docs.html)
    // to place the requests asynchronously, so we can benefit from parallel
    // computation on the AWS end. You can get burned, though, if you set
    // numToGenerate too high as there are a host of AWS capacity limits that
    // you might exceed, leading to a failed HTTP requests. I've had no trouble
    // with up to 500 at a time, but 1,000 regularly breaks things.
    //
    // We never do anything with the `event` argument because we know what
    // button was clicked and don't care about anything else.
    function randomRoutes(event) {
        const runId = $('#runId-text-field').val();
        const generation = $('#generation-text-field').val();
        const numToGenerate = $('#num-to-generate').val();
        // Reset the contents of `#new-route-list` so that it's ready for
        // `showRoute()` to "fill" it with the incoming new routes. 
        $('#new-route-list').text('');
        // 
        async.times(numToGenerate, () => randomRoute(runId, generation));
    }

    // When a request for a new route is completed, add an `<li>…</li>` element
    // to `#new-route-list` with that routes information.
    function showRoute(result) {
        console.log('New route received from API: ', result);
        const routeId = result.routeId;
        const length = result.length;
        $('#new-route-list').append(`<li>We generated route ${routeId} with length ${length}.</li>`);
    }

    // Make a `GET` request that gets the K best routes.
    // The form of the `GET` request is:
    //   …/best?runId=…&generation=…&numToReturn=…
    // This request will return an array of
    //    { length: …, routeId: …}
    // You should add each of these to `#best-route-list`
    // (after clearing it first).
    function getBestRoutes(event) {

        console.log('getBestRoutes')

        const runId = $('#runId-text-field').val();
        const getLim = $('#num-best-to-get').val();
        const gen = $('#generation-text-field').val();

        const url = baseUrl + `/best?runId=${runId}&generation=${gen}&numToReturn=${getLim}`;

        $('#best-route-list').text('');

        $.ajax(
            {
                method: 'GET',
                url: url,
                contentType: 'application/json', // Declaring the type sent to the db

                success: printBestRoute,

                error: function ajaxError(jqXHR, textStatus, errorThrown) {

                    console.error(
                        'Error when getting the route: ',
                        textStatus,
                        ', Details: ',
                        errorThrown
                    );

                    console.error('Response: ', jqXHR.responseText);

                    alert('An error occurred when getting the details for the routes: \n' + jqXHR.responseText);
                }
            }
        )
    }

    function printBestRoute(result) {

        for (let i = 0; i < result.length; i++) {

            const routeId = result[i].routeId;
            const length = result[i].length;

            $('#best-route-list').append(
                `<br><li>Route ID: ${routeId}</li>
                <li>Route Distance: ${length}</li>
                `
            );
        }
    }

    // Make a `GET` request that gets all the route information
    // for the given `routeId`.
    // The form of the `GET` request is:
    //   …/routes/:routeId
    // This request will return a complete route JSON object.
    // You should display the returned information in 
    // `#route-by-id-elements` (after clearing it first).
    function getRouteById(event) {

        console.log('getRouteById');

        const routeId = $('#route-ID').val();

        const url = baseUrl + '/routes/' + routeId;

        $('#route-by-id-elements').text('');

        $.ajax(
            {
                method: 'GET',
                url: url,
                contentType: 'application/json',

                success: printRouteDetails,

                error: function ajaxError(jqXHR, textStatus, errorThrown) {
                    console.error(
                        'Error getting the details of the route by ID',
                        textStatus,
                        ', Details: ',
                        errorThrown
                    );
                    console.error('Response: ', jqXHR.responseText);
                    alert('An error occurred when getting the details for the route: \n' + jqXHR.responseText);
                }
            }
        )
    }

    function printRouteDetails(result) {

        const route = result.route;
        const length = result.length;
        const partitionKey = result.partitionKey;
        const routeId = result.routeId;

        $('#route-by-id-elements').append(
            `<br><li>Route: ${route} </li>
            <br><li>Route Distance: ${length}</li>
            <br><li>Partition Key: ${partitionKey}</li>
            <br><li>Route ID: ${routeId}</li>`
        );
    }

}(jQuery));
