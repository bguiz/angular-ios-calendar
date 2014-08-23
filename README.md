# angular-ios-calendar

An iOS 7 style calendar,
exposed as an AngularJs directive.

## Usage

In the root of your AngularJs project, run the following command:

    bower install --save angular-ios-calendar

In your application Javascript, find where you instantiate your AngularJs app,
and add this package as a dependency:

    angular.module('myapp', [
        'bguiz.angular.ioscalendar' // add this line
    ])
    .config( /* ... */ );

Anywhere in your application templates,
add the directive to your markup:

    <angular-calendar>
    </angular-calendar>

## Scope parameters

This is the isolate scope definition of the directive:

    scope: {
        events: '=',
        selectDate: '&',
    }

As such, you may pass in an `events` variable,
and a `selectDate` function,
like so:

    <angular-calendar
        events="ctrl.events"
        select-date="ctrl.selectDate(date)">
    </angular-calendar>

- `events`:
    - Expects an array of objects
    - Each object contains a key, `start`, which should be a valid [`moment`](http://momentjs.com/)
- `selectDate`:
    - Expects a callback function
    - The function should accept a single parameters, named `date`, which should be a valid [`moment`](http://momentjs.com/)
    - This callback function will be invoked whenever the user selects a different date on the calendar
        - This is the primary means of communication between the calendar directive and the context in which it is used

## Troubleshooting

- moment
    - This project does *not* include momentjs as a dependency itself
    - It expects the application project to include momentjs instead
    - Run `bower install --save momentjs` in the root folder of your application

- HTML
    - If the calendar directive does not render at all:
        - Check the console output in your browser to ensure that `calendar.html` is found correctly
    - Ensure that the build step for your main app incorporates `calendar.html` into its final build

e.g. If you are using gulp, in `gulpfile.js`:

Change this:

    gulp.src([
        './src/app/**/*.html',
        '!./src/app/index.html',
    ])

To this:

    gulp.src([
        './src/app/**/*.html',
        // './bower_components/**/*.html', //This line adds HTML files from all bower components
        './bower_components/angular-ios-calendar/*.html', //This line is specific to HTML files from this package
        '!./src/app/index.html',
    ])

- CSS
    - If the calendar directive renders, but all CSS styles are missing:
        - Check the console output in your browser to ensure that `calendar.scss` is found and pre-processed
    - Ensure that thebuild step for your main app incorporates `calendar.css` into its final build

e.g. If you are using gulp.js, in `gulpfile.js`

Change this:

    gulp.src([
        './src/app/**/*.scss',
        '!./src/app/**/_*.scss'
      ])

To this:

    gulp.src([
        './src/app/**/*.scss',
        '!./src/app/**/_*.scss',
        // './bower_components/**/*.scss', //These lines add SCSS files from all bower components
        // '!./bower_components/**/_*.scss'
        './bower_components/**/*.scss',  //These lines are specific to SCSS files from this package
        '!./bower_components/**/_*.scss'
      ])

## Roadmap

- [ ] Currently, calendar only indicates which days have events
    - Display individual events

## License

GPLv3
