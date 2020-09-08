/*global document, window, angular*/
"use strict";
(function (jq, lodash) {
    const  app = angular.module('rm-tmp', []);

    app.controller('TableListCrtl', function TableListCrtl($scope) {
        $scope.PAGE_SIZE = 10;
        $scope.cursor = 0;

        let STASH = {};
        let STASH_INIT = true;

        const pager = {
            current_page: () => {
                return Math.ceil(($scope.cursor / $scope.PAGE_SIZE) + 1);
            },
            page_start: (page) => {
                return ($scope.PAGE_SIZE * page) - $scope.PAGE_SIZE;
            },
            last_page: () => {
                const len = $scope.filtered ? $scope.filtered.length : window.results.length;
                return Math.floor(len / $scope.PAGE_SIZE) + 1;
            },
            jump: (page) => {
                $scope.cursor = ($scope.PAGE_SIZE * page) - $scope.PAGE_SIZE;
            },
            first: () => {
                if (STASH_INIT) { return; }
                $scope.cursor = 0;
            },
            last: () => {
                pager.jump(pager.last_page());
            },
            next: () => {
                if (pager.current_page() < pager.last_page()) {
                    pager.jump(pager.current_page() + 1);
                }
            },
            prev: () => {
                if (pager.current_page() > 0) {
                    pager.jump(pager.current_page() - 1);
                }
            }
        };

        window.p = pager;
        window.s = $scope;

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

        function get_breakpoint() {
            let ret = 'sm';
            for (let size of ['xs', 'sm', 'md', 'lg', 'xl']) {
                const s = window.getComputedStyle(document.documentElement).getPropertyValue(`--breakpoint-${size}`);
                if (window.matchMedia(`(min-width: ${s})`).matches) {
                    ret = size;
                }
            }

            return ret;
        };

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

        function set_default_page_size() {
            switch (get_breakpoint()) {
            case 'xs': $scope.PAGE_SIZE = 5
                document.getElementById('resultsTable').style.fontSize = 'small';
                break;
            case 'sm': $scope.PAGE_SIZE = 10;
                document.getElementById('resultsTable').style.fontSize = 'small';
                break;
            case 'md': $scope.PAGE_SIZE = 10; break;
            case 'lg': $scope.PAGE_SIZE = 20; break;
            case 'xl': $scope.PAGE_SIZE = 20; break;
            }
        }

        function init_swipe_handler() {
            if (!window.mobileCheck()) {
                return;
            }

            delete window.Hammer.defaults.cssProps.userSelect;
            const hammertime = new window.Hammer(document.getElementById('resultsTable'));
            hammertime.on('swipeleft', () => {
                pager.next();
                $scope.$digest();
            });

            hammertime.on('swiperight', () => {
                pager.prev();
                $scope.$digest();
            });
        }

        function stash_bookmarked() {
            try {
                const orig = window.location.hash;
                const hash = orig.substr(1, orig.length + 1);
                const obj = JSON.parse(atob(hash));
                console.log(`STASHED ${JSON.stringify(obj)}`);
                STASH = obj;
            } catch (e) {
                console.log(e);
            }
        }

        function init_bookmarked($scope) {
            $scope.search = STASH.s;

            if (STASH.p && STASH.p > 1) {
                pager.jump(STASH.p);
            }

            next_tick(() => { STASH_INIT = false; });
        }

        window.arrow_handler = () => {
            if (window.event.target.toString() === '[object HTMLBodyElement]') {
                switch (window.event.keyCode) {
                case 39: pager.next(); $scope.$digest(); break;
                case 37: pager.prev(); $scope.$digest(); break;
                }
            }
        };

        $scope.clear_other = (key) => {
            if ($scope.search && $scope.search[key]) {
                delete $scope.search[key];
            }
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

        $scope.gen_quick_pages = () => {
            const current_page = pager.current_page();
            $scope.quick_pages = [];

            function add_o(i) {
                const o = {
                    num: i,
                    jump: () => { pager.jump(i); }
                };

                if ($scope.cursor === pager.page_start(i)) {
                    o.active = true;
                }

                $scope.quick_pages.push(o);
            }


            for (let i of lodash.range(current_page - 2, current_page + 3)) {
                const MAX = pager.last_page() + 1;
                if (i > 0 && i < MAX) {
                    add_o(i);
                }
            }
        };

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

        $scope.reset_page_size = () => {
            pager.first();
        };

        function next_tick(f) {
            window.setTimeout(f, 1);
        }

        function make_bookmarkable(i) {
            const search = i[0];
            const page = pager.current_page();

            let obj = {
                s: {}
            };

            for (const key of lodash.keys(search)) {
                obj.s[key] = search[key];
            }

            if (page > 1) {
                obj.p = page;
            }

            console.log(JSON.stringify(obj));
            console.log(btoa(JSON.stringify(obj)));
            next_tick(() => {
                 window.location.hash = btoa(JSON.stringify(obj));
            });
        }

        function init() {
            stash_bookmarked();
            set_default_page_size();
            init_swipe_handler();

            console.time('denormalize');
            denormalize_events();
            console.timeEnd('denormalize');

            $scope.results   = window.results;
            $scope.users     = window.users;
            $scope.events    = window.events;
            $scope.years     = gen_years();
            $scope.pager     = pager;
            $scope.stored    = {};
            $scope.my_order  = 'cert/1';
            $scope.hidden    = 'scope="col" class="d-none d-sm-table-cell"';

            gen_distances();
            init_bookmarked($scope);

            next_tick(() => {
                $scope.$watch('[search,tmp]', pager.first, true);
                $scope.$watch('[search, cursor]', make_bookmarkable, true);
            });

            $scope.$watch('cursor', $scope.gen_quick_pages, true);
        }

        init();
    });
}(window.jQuery, window._));
