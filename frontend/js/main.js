/*global document, window, angular*/
"use strict";
(function (jq, lodash) {
    const  app = angular.module('rm-tmp', []);

    app.controller('TableListCrtl', function TableListCrtl($scope) {
        var once = true;
        const size = 25;

        $scope.cursor = 0;

        const pager = {
            first: () => {
                $scope.cursor = 0;
            },
            last: () => {
                $scope.cursor = $scope.filtered.length - size;
            },
            next: () => {
                let cursor = $scope.cursor + size;
                if (cursor > ($scope.filtered.length - size)) { cursor = $scope.filtered.length - size; }
                $scope.cursor = cursor;
            },
            prev: () => {
                let cursor = $scope.cursor - size;
                if (cursor < 0) { cursor = 0; }
                $scope.cursor = cursor;
            }
        };

        function gen_years() {
            return lodash.range(1989, 2020);
        }

        function denormalize_events() {
            for (let r of window.results) {
                r.rider_name = `${window.users[r.uid].lname}, ${window.users[r.uid].fname}`;
                r.year = `${window.events[r.eid].date.substring(0,4)}`;
                r.date = `${window.events[r.eid].date.substring(0,10)}`;
                r.cid = `${window.events[r.eid].cid}`;
                r.country = `${window.countries[r.cid]}`;
                r.cid = r.cid.toLowerCase();
                r.dist = `${window.events[r.eid].dist}`;
                r.event_name = `${window.events[r.eid].name}`;

                // this is not event denormalization :D
                r.time = r.time.toLowerCase();
                const hm = r.time.split('h');
                r.mins = (hm[0] * 60)/1 + hm[1]/1;
            }
        }

        function gen_distances() {
            $scope.distances = [];
            for (let d of lodash.range(12, 20)) {
                const floor = d * 100;
                const ceil = (d * 100) + 99;
                $scope.distances.push({
                    display: `${floor} - ${ceil}`
                });
            }
            $scope.distances.push({
                display: '2000 - 9999'
            });
        }

        function init() {
            console.time('denormalize');
            denormalize_events();
            console.timeEnd('denormalize');

            $scope.results  = window.results;
            $scope.users    = window.users;
            $scope.events   = window.events;
            $scope.years    = gen_years();
            $scope.pager    = pager;
            $scope.stored   = {};
            $scope.my_order = 'cert/1';

            gen_distances();

            $scope.range_filter = (result) => {
                if ($scope.tmp && $scope.tmp.dist) {
                    const d = $scope.tmp.dist.split(' - ');
                    return (result.dist >= d[0]) && (result.dist <= d[1]);
                }

                return true;
            };
        }

        init();
    });
}(window.jQuery, window._));
