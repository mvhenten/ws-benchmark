const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

function main() {
    for (let i = 0; i < 1; i++) {
        const socket = new WebSocket("wss://b90119e9909448869b625301b4dfd680.dev-dsk-mvhenten2.aka.amazon.com:6443/");

        socket.addEventListener('open', function(event) {
            console.log('Hello Server!', i);
        });

        // Listen for messages
        socket.addEventListener('message', function(event) {
            console.log('Message from server ', i);
            
            // socket.close(102, 'bye bye');
        });
        // Listen for messages
        socket.addEventListener('error', function(event) {
            console.log('error from server ', i);
            
            // socket.close();
        });
        // Listen for messages
        socket.addEventListener('close', function(event) {
            console.log('close from server ', i);
            
            // socket.close();
        });
        
    }
}


const html = `
<body>
<h1>hello ${new Date()}</h1>
<script type="text/javascript">
    ${main.toString()}
    main();
</script>
</body>
`;

const server = http.createServer((req, res) => {
    console.log(req.uri);
    res.write(html);
    res.end();
});

const wss = new WebSocket.Server({ server });

const dataSources = [
    fs.readFileSync("30mb.txt"),
    fs.readFileSync("60mb.txt"),
    fs.readFileSync("100mb.txt"),
    fs.readFileSync("200mb.txt"),
    fs.readFileSync("400mb.txt"),
    fs.readFileSync("800mb.txt"),
];

console.log(`Benchmarking ${dataSources.length} data sources`);

wss.on('connection', async (ws) => {
    let start = Date.now();
    let id = Date.now().toString(36);
    console.log(`[${id}] Open connection ${new Date()}`);
    
    ws.on("close", () => {
        console.log(`[ ${id}] Close connection, duration: ${Math.round((Date.now() - start)/1000)}s`);
    });

    for (let data of dataSources) {
        let sendStart = Date.now();
        
        await new Promise((resolve) => {
            ws.send(data, resolve);
        });
        
        let duration = Date.now() - sendStart;
        let mbs = Math.round((data.length / duration)/1000);

        console.log(`[${id}] Sent ${Math.round(data.length/10e5)} MB of data in ${Math.round((Date.now() - sendStart)/1000)}s, ${mbs}MB/s`);
    }

});

server.listen(8080);