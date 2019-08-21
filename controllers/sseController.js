/**
 * EMIT SSE
 * Emits a server-sent event with the provided body.
 *
 * @param {string} sseBody Formed SSE body
 *                          Example: 'id: 54\n event: new-ancestor\n data: data\n\n'
 * @param {object} response HTTP Response object to write the sseResponse to
 * @param {function} callback Function to call with any errors
 */
function emitSSE(sseBody, response, callback) {
    if (!sseBody.includes('\n\n')) {
        // Throw error
        callback('SSE Body must contain 2 newline characters at end');
    }

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    // This sends the response, by virtue of the '\n\n' at the end
    //  of the sseBody.
    response.write(sseBody);
    callback();
}

/**
 * CREATE SSE BODY
 * Creates an SSE formatted body from the given parameters.
 *
 * @param {string} data String of data to append to SSEBody
 * @param {string} event String signifying an event to associate this SSEBody with
 * @returns An SSE formatted body
 */
function createSSEBody(data, event) {
    var sseBody = '';

    var id = new Date().toLocaleTimeString();

    sseBody += 'id: ' + id + '\n';
    if (event) { sseBody += 'event: ' + event + '\n'; }
    sseBody += 'data: ' + data + '\n\n';

    return sseBody;
}

module.exports = {
    emitSSE: emitSSE,
    createSSEBody: createSSEBody
};
