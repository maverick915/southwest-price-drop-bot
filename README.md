# southwest-price-drop-bot


This tool lets you monitor the price of Southwest flights that you've booked. It will text you if the price drops below what you originally paid. Then you can [re-book the same flight](http://dealswelike.boardingarea.com/2014/02/28/if-a-southwest-flight-goes-down-in-price/) and get Southwest credit for the price difference.


## Deployment

1. Click this button: [![deploy][deploy-image]][deploy-href]
1. Fill out the config variables and click `Deploy`
1. Open up the `Heroku Scheduler` from your app's dashboard
1. Add an hourly task that runs `npm run task:check`


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
