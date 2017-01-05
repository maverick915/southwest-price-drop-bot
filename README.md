# southwest-price-drop-bot


Bot that watches Southwest flights for price drops.


## Deployment

1. Click this button: [![deploy][deploy-image]][deploy-href]
1. Fill out the config variables and click `Deploy`
1. Open up the `Heroku Scheduler` from your app's dashboard
1. Add an hourly task that runs `node --harmony_async_await tasks/check.js`


## Screenshots

<kbd>
  <a href="https://raw.githubusercontent.com/scott113341/southwest-price-drop-bot/master/screenshots/web-screenshot.png">
    <img src="./screenshots/web-screenshot.png" width="400" />
  </a>
</kbd>

<kbd>
  <a href="https://raw.githubusercontent.com/scott113341/southwest-price-drop-bot/master/screenshots/sms-screenshot.png">
    <img src="./screenshots/sms-screenshot.png" width="200" />
  </a>
</kbd>


[deploy-image]: https://www.herokucdn.com/deploy/button.svg
[deploy-href]: https://heroku.com/deploy
