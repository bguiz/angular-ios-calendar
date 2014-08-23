/*globals console, moment*/

var module = angular.module('bguiz.angular.ioscalendar', []);

module.directive('angularCalendar', function() {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        templateUrl: '/angular-ios-calendar/calendar.html',
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

            scope.$watch('options.date', onDateChange);
            scope.$watch('options.gridMode', onGridModeChange);
            scope.$watchCollection('events', onEventsChange);
            makeEventsByDay();
            onDateChange(scope.options.date);

            function onGridModeChange(/*newVal , oldVal*/) {
                scope.cachedGridStart = null;
                makeGrid();
            }

            function onDateChange(newVal , oldVal) {
                if (newVal && oldVal) {
                    //move the today tag
                    updateGridTags();
                }
                scope.headerDisplayDate = scope.options.date.format('DD MMM YYYY');
                makeGrid();
            }

            function onEventsChange(/*newVal , oldVal*/) {
                makeEventsByDay();
                updateGridTags();
            }

            function makeGrid() {
                var mode = scope.options.gridMode;
                var date = scope.options.date;
                var today = moment();
                var cachedGridStart = scope.cachedGridStart;
                var grid = [];
                if (mode === 'week') {
                    //find first day of this week
                    var dayOfWeek = date.day();
                    var startOfWeek = date.clone().add('days', 0 - dayOfWeek);
                    if (startOfWeek.isSame(cachedGridStart, 'day')) {
                        return;
                    }
                    cachedGridStart = startOfWeek.clone();
                    var week = [];
                    for (var i = 0; i < 7; ++ i) {
                        var day = startOfWeek.clone().add('days', i);
                        var tag = '';
                        if (day.isSame(date, 'day')) {
                            tag = 'current';
                        }
                        else if (day.isSame(today, 'day')) {
                            tag = 'today';
                        }
                        var events = findEventsOnDay(day);
                        week.push({
                            dd: day.date(),
                            mm: day.month(),
                            tag: tag,
                            events: events,
                            hasEvents: (events.length > 0),
                        });
                    }
                    grid.push(week);
                }
                else if (mode === 'month') {
                    var startOfMonth = date.clone().add('days', 1 - date.date());
                    var month = startOfMonth.month();
                    var dayOfWeek = startOfMonth.day();
                    var startOfWeek = startOfMonth.clone().add('days', 0 - dayOfWeek);
                    if (startOfWeek.isSame(cachedGridStart, 'day')) {
                        return;
                    }
                    cachedGridStart = startOfWeek.clone();
                    while (startOfWeek.month() <= month) {
                        var week = [];
                        for (var i = 0; i < 7; ++i) {
                            var day = startOfWeek.clone().add('days', i);
                            var tag = '';
                            if (day.isSame(date, 'day')) {
                                tag = 'current';
                            }
                            else if (day.isSame(today, 'day')) {
                                tag = 'today';
                            }
                            else if (day.month() < month) {
                                tag = 'past';
                            }
                            else if (day.month() > month) {
                                tag = 'future';
                            }
                            var events = findEventsOnDay(day);
                            week.push({
                                dd: day.date(),
                                mm: day.month(),
                                tag: tag,
                                events: events,
                                hasEvents: (events.length > 0),
                            });
                        }
                        grid.push(week);
                        startOfWeek.add('days', 7);
                    }
                }
                scope.grid = grid;
                scope.cachedGridStart = cachedGridStart;
            }

            function updateGridTags() {
                var date = scope.options.date;
                var dd = date.date();
                var mm = date.month();
                var today = moment();
                var ddToday = today.date();
                var mmToday = today.month();
                scope.grid.forEach(function(week) {
                    week.forEach(function(day) {
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
                            day.tag = null;
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
