# MoreOn

[![travis ci](https://travis-ci.org/deltreey/moreon.svg)][6]
[![Codacy Badge](https://www.codacy.com/project/badge/69f5ab2cee034b3fb8cb46101c464a17)][10]
[![Code Climate](https://codeclimate.com/github/deltreey/moreon/badges/gpa.svg)][7]
[![bitHound Score](https://www.bithound.io/github/deltreey/moreon/badges/score.svg)][8]
[![Join the chat at https://gitter.im/deltreey/moreon](https://badges.gitter.im/Join%20Chat.svg)][9]

* MoreOn your data
* MoreOn your server load
* MoreOn your disk space
* MoreOn your RAM
* MoreOn your CPU Usage
* MoreOn your Bandwidth

## Just do it MoreOn!

With this tool you can easily add monitoring to any server in your network with SSH enabled.  You can run it locally, or host it on a server and gather historical data over time.

It uses node.js, so it's extremely light weight, storing it's data in MongoDB.  It runs remote bash script commands via [simple-ssh][1] to execute it's actions, offering the option to store your own custom scripts and run them at a configurable cadence.

The default scripts are:

* Disk usage is found via `df -lh | awk 'FNR == 2 {print substr($5, 1, length($5)-1)}'`
* RAM usage is found via `free | grep Mem | awk '{print ($3 / ($3 + $4)) * 100}'`
* CPU usage is found via `ps aux | awk {'sum+=$3;print sum'} | tail -n 1`

The commands used and duration between checks are completely configurable to further allow you to tweak that delicate balance between the information you want and the server resources you need.  You can even add your own scripts to run regularly and see further information about your data.

## Display your MoreOn proudly!

The data is displayed in chats using the angular directive for [google-charts][4].  You can display any data from scripts in graph form, as long as it returns a number.  For this reason, you may want to do a bit of parsing with `grep` or `awk` or the like.  If you keep the system running, then the historical data will create beautiful line graphs.

This is not only a great tool for monitoring, but also for running regular jobs.  For example: you could run daily builds and return the percentage of code coverage.

If you are coding locally and want to deploy it, try `grunt build` and just copy the contents of the `dist/` directory to where you want to deploy.  To run the server with a minimal install on `localhost:8080`

```bash
export SSH_KEY="$(cat ~/.ssh/id_rsa)"
npm install --production
npm start --production
```

## There are already lots of MoreOns

Yes, there are other tools for monitoring, but I wanted something that

* I didn't have to install on every server, taking up resources
* Was super lightweight, using almost no resources itself
* Could run on a [Raspberry Pi][5]

MoreOn does all of that and more, so I just had to share it with the world.  I have it running internally on a Raspberry Pi monitoring servers on my network, so I know it works.  Let's see how you use it!

## So what does a MoreOn look like?

On a normal screen, it spreads out to display lots of data at once.

![moreon on wide screen](https://lh3.googleusercontent.com/ytdMpqhhOUjVgIxiar_DnPDer-ztvrNAOa33ELBT8fw=w1918-h995-no)

But thanks to bootstrap, it scales well and looks good on lots of screen sizes.

![moreon on medium screen](https://lh3.googleusercontent.com/kxMxr8nYy7hHECDa1Ui41_0PVc-nDeZYTxDb8BEfYNE=w1170-h785-no)

![moreon on small screen](https://lh3.googleusercontent.com/qxxsKxN6OEPliwAaSGvv3eG-xwWuGdrxllKk070Qnvk=w761-h784-no)

![moreon on tiny screen](https://lh3.googleusercontent.com/TdwigOfNutUuAeLkY7r89z6mnQc4ew59mIMfhhEDbfU=w312-h717-no)

## Want to contribute and help this MoreOn?

This tool is generated using [yeoman][2] with the [generator-angular-fullstack][3].  That means that building and testing is easy.  Make sure you have MongoDB running and nodejs installed, and then:
```bash
git clone https://github.com/deltreey/moreon.git
npm install
# npm install -g bower # if you don't have it
bower install # only needed when pulling
# npm install -g grunt-cli # if you don't have it
grunt serve
```

Then just let the server sit there while you change files, updating automatically.  Please make sure jshint and the tests pass before you put in a pull request.

[1]: https://github.com/MCluck90/simple-ssh
[2]: http://yeoman.io/
[3]: https://github.com/DaftMonk/generator-angular-fullstack
[4]: http://bouil.github.io/angular-google-chart/#/fat
[5]: https://www.raspberrypi.org/
[6]: https://travis-ci.org/deltreey/moreon
[7]: https://codeclimate.com/github/deltreey/moreon
[8]: https://www.bithound.io/github/deltreey/moreon
[9]: https://gitter.im/deltreey/moreon?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[10]: https://www.codacy.com/app/suicidolt/moreon
