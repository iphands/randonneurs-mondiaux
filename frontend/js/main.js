/*global document, window, angular*/
"use strict";
(function (jq, lodash) {
    const  app = angular.module('rm-tmp', []);

    app.controller('TableListCrtl', function TableListCrtl($scope) {
        const PAGE_SIZE = 10;

        $scope.cursor = 0;

        const pager = {
            first: () => {
                $scope.cursor = 0;
            },
            last: () => {
                $scope.cursor = $scope.filtered.length - PAGE_SIZE;
            },
            next: () => {
                let cursor = $scope.cursor + PAGE_SIZE;
                if (cursor > ($scope.filtered.length - PAGE_SIZE)) { cursor = $scope.filtered.length - PAGE_SIZE; }
                $scope.cursor = cursor;
            },
            prev: () => {
                let cursor = $scope.cursor - PAGE_SIZE;
                if (cursor < 0) { cursor = 0; }
                $scope.cursor = cursor;
            }
        };

        function gen_years() {
            const arr = lodash.uniq(
                lodash.map(
                    lodash.map(
                        lodash.values(window.events), 'date'
                    ), (i) => { return i.substring(0 ,4); }
                )
            );

            return arr;
        }

        function denormalize_events() {
            for (let r of window.results) {
                r.rider_name = `${window.users[r.uid].lname}, ${window.users[r.uid].fname}`;
                r.rider_fname = window.users[r.uid].fname;
                r.rider_lname = window.users[r.uid].lname;
                r.year = `${window.events[r.eid].date.substring(0,4)}`;
                r.date = `${window.events[r.eid].date.substring(0,10)}`;
                r.cid = `${window.events[r.eid].cid}`;
                r.country = `${window.countries[r.cid]}`;
                r.cid = r.cid.toLowerCase();
                r.dist = `${window.events[r.eid].dist}` / 1;
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
                    val: `${floor} - ${ceil}`,
                    display: `${floor}s`
                });
            }
            $scope.distances.push({
                val: '2000 - 999999',
                display: '2000+'
            });
        }

        function init() {
            console.time('denormalize');
            denormalize_events();
            console.timeEnd('denormalize');

            $scope.PAGE_SIZE = PAGE_SIZE;
            $scope.results   = window.results;
            $scope.users     = window.users;
            $scope.events    = window.events;
            $scope.years     = gen_years();
            $scope.pager     = pager;
            $scope.stored    = {};
            $scope.my_order  = 'cert/1';
            $scope.hidden    = 'scope="col" class="d-none d-sm-table-cell"';

            $scope.clear_other = (key) => {
                delete $scope.search[key];
            };

            $scope.uniq = (field) => {
                return lodash.uniq(lodash.map($scope.filtered, field)).length;
            };

            $scope.total_kms = () => {
                return Math.trunc(lodash.sum(lodash.map($scope.filtered, 'dist')));
            };

            $scope.total_time = () => {
                const total = lodash.sum(lodash.map($scope.filtered, 'mins'));
                const hours = Math.floor(total/60);
                const mins = total % 60;
                return `${hours}h${mins}`;
            };

            gen_distances();

            $scope.starts_with = (result) => {
                if ($scope.tmp && $scope.tmp.starts) {
                    let ret = true;

                    if ($scope.tmp.starts.cert) {
                        ret = result.cert.indexOf($scope.tmp.starts.cert) === 0;
                    }

                    if (ret != false && $scope.tmp.starts.time) {
                        return result.time.indexOf($scope.tmp.starts.time) === 0;
                    }

                    return ret;
                }

                return true;
            };

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
