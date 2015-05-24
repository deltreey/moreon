# More On

* More On your data
* More On your disk space
* More On your RAM
* More On your CPU Usage
* More On your Bandwidth

## Just do it Moron!

With this tool you can easily add monitoring to any server in your network with SSH enabled.  You can run it locally, or host it on a server and gather historical data over time.

It uses node.js, so it's extremely light weight, storing it's data in MongoDB.  It runs remote bash script commands via [simple-ssh][1] to execute it's actions, offering the option to store your own custom scripts and run them at a configurable cadence.

* Disk usage is found via the `df` command.
* RAM usage is found via the `free` command.
* CPU usage is found via the `top` command.

Data is parsed by nodejs, so the load on your server is minimized.  The duration between checks is configurable to further allow you to tweak that delicate balance between the information you want and the server resources you need.

To run the server with minimal resources on `localhost:8080`
```bash
npm install --production
npm start --production
```

[1]: https://github.com/MCluck90/simple-ssh