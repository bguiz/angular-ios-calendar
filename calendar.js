/*globals console, moment*/

var module = angular.module('angular-ios-calendar', []);

module.directive('angularCalendar', function() {
    'use strict';
    var firstDayOfWeek = 0; //Sunday
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'angular-ios-calendar/calendar.html',
        scope: {
            events: '=',
            selectDate: '&',
        },
        link: function(scope, elem, attrs) {
            scope.options = {
                date: moment(),
                gridMode: 'month',
            };
            scope.changeDate = function(increment) {
                scope.options.date = scope.options.date.clone().add(increment, scope.options.gridMode);
                console.log(scope.options.date.format('YYYYMMDD'));
            };
            scope.toggleGridMode = function() {
                scope.options.gridMode = (scope.options.gridMode === 'month') ? 'week' : 'month';
                console.log(scope.options.gridMode);
            };
            scope.selectDay = function(day) {
                scope.options.date = scope.options.date.clone().month(day.mm).date(day.dd);
                scope.selectDate({ date: scope.options.date });
                console.log(scope.options.date.format('YYYYMMDD'));
            };

            makeEventsByDay();
            updateHeader();

            scope.$watch('options.date', onDateChange);
            scope.$watch('options.gridMode', onGridModeChange);
            scope.$watchCollection('events', onEventsChange);

            scope.$watchCollection('grid', function(newVal, oldVal) {
                console.log('grid', 'new', newVal, 'old', oldVal);
            });

            function onGridModeChange(/*newVal , oldVal*/) {
                scope.cachedGridStart = null;
                makeGrid();
            }

            function updateHeader() {
                scope.headerDisplayDate = scope.options.date.format('DD MMM YYYY');
            }

            function onDateChange(newVal , oldVal) {
                if (newVal && oldVal) {
                    updateGridTags();
                }
                updateHeader();
                makeGrid();
            }

            function onEventsChange(/*newVal , oldVal*/) {
                makeEventsByDay();
                updateGridEvents();
                updateGridTags();
            }

            function makeGrid() {
                var mode = scope.options.gridMode;
                var date = scope.options.date;
                var today = moment();
                var cachedGridStart = scope.cachedGridStart;
                var grid = [];
                var dayOfWeek, startOfWeek, week, events, hasEvents, day, tag;
                if (mode === 'week') {
                    //find first day of this week
                    dayOfWeek = date.day();
                    startOfWeek = date.clone().add(firstDayOfWeek - dayOfWeek, 'days');
                    if (startOfWeek.isSame(cachedGridStart, 'day')) {
                        updateGridTags();
                        return;
                    }
                    cachedGridStart = startOfWeek.clone();
                    week = [];
                    for (var i = 0; i < 7; ++ i) {
                        day = startOfWeek.clone().add('days', i);
                        week.push({
                            moment: day,
                            dd: day.date(),
                            mm: day.month(),
                            yyyy: day.year(),
                        });
                    }
                    grid.push(week);
                }
                else if (mode === 'month') {
                    var startOfMonth = date.clone().add(1 - date.date(), 'days');
                    var month = startOfMonth.month();
                    var startOfNextMonth = startOfMonth.clone().add(1, 'months');
                    dayOfWeek = startOfMonth.day();
                    startOfWeek = startOfMonth.clone().add( firstDayOfWeek - dayOfWeek, 'days');
                    if (startOfWeek.isSame(cachedGridStart, 'day')) {
                        updateGridTags();
                        return;
                    }
                    cachedGridStart = startOfWeek.clone();
                    while (startOfWeek.isBefore(startOfNextMonth)) {
                        week = [];
                        for (var i = 0; i < 7; ++i) {
                            day = startOfWeek.clone().add('days', i);
                            week.push({
                                moment: day,
                                dd: day.date(),
                                mm: day.month(),
                                yyyy: day.year(),
                            });
                        }
                        grid.push(week);
                        startOfWeek.add('days', 7);
                    }
                }
                scope.grid = [];
                scope.grid = grid;
                scope.cachedGridStart = cachedGridStart;
                updateGridEvents();
                updateGridTags();
            }

            function updateGridEvents() {
                scope.grid.forEach(function(week) {
                    week.forEach(function(day, idx) {
                        day.events = findEventsOnDay(day.moment);
                        day.hasEvents = (day.events.length > 0);
                    });
                });
            }

            function updateGridTags() {
                var date = scope.options.date;
                var dd = date.date();
                var mm = date.month();
                var today = moment();
                var ddToday = today.date();
                var mmToday = today.month();
                scope.grid.forEach(function(week) {
                    week.forEach(function(day, idx) {
                        if (day.dd === ddToday && day.mm === mmToday) {
                            day.tag = 'today';
                        }
                        else if (day.dd === dd && day.mm === mm) {
                            day.tag = 'current';
                        }
                        else if (day.mm < mm) {
                            day.tag = 'past';
                        }
                        else if (day.mm > mm) {
                            day.tag = 'future';
                        }
                        else {
                            day.tag = '';
                        }

                        if (day.hasEvents) {
                            day.tag = day.tag + ' has-events';
                        }
                        if (idx === 0 || idx === 6) {
                            day.tag = day.tag + ' weekend';
                        }
                    });
                });
            }

            function findEventsOnDay(day) {
                return scope.options.eventsByDay[day.format('YYYYMMDD')] || [];
            }

            function makeEventsByDay() {
                var events = scope.events;
                console.log('makeEventsByDay', events);
                var eventsByDay = {};
                if (Array.isArray(events)) {
                    events.forEach(function(ev) {
                        var key = ev.start.format('YYYYMMDD');
                        var val = eventsByDay[key];
                        if (!val) {
                            val = [];
                        }
                        val.push(ev);
                        eventsByDay[key] = val;
                    });
                }
                scope.options.eventsByDay = eventsByDay;
            }
        },
    };
});
