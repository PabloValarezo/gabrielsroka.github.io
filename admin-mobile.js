(function () {
    var users = {
        url: "/api/v1/users",
        data: function () {return {q: this.search, limit: this.limit};},
        limit: 10,
        comparer: (user1, user2) => (user1.profile.firstName + user1.profile.lastName).localeCompare(user2.profile.firstName + user2.profile.lastName),
        template: user => {
            var creds = user.credentials.provider;
            var logo = creds.type == "LDAP" ? "ldap_sun_one" : creds.type.toLowerCase();
            return `<tr><td><span class='icon icon-24 group-logos-24 logo-${logo}'></span>` +
                `<td><a href="/admin/user/profile/view/${user.id}#tab-account">${user.profile.firstName} ${user.profile.lastName}</a>` +
                `<td>${user.profile.login}<br>${user.profile.email}`;
        },
        placeholder: "Search Active by First/Last/Email...",
        headers: "<tr><th>Source<th>Person<th>Username & Email"
    };
    var groups = {
        url: "/api/v1/groups",
        data: function () {return {q: this.search, limit: this.limit};},
        limit: 10,
        comparer: (group1, group2) => group1.profile.name.localeCompare(group2.profile.name),
        template: group => {
            var type = group.type == "OKTA_GROUP" ? "okta" : "active_directory";
            return `<tr><td><span class='icon icon-24 group-logos-24 logo-${type}'></span>` +
                `<td><a href="/admin/group/${group.id}">${group.profile.name}</a><br>${group.profile.description || ""}`;
        },
        headers: "<tr><th>Source<th>Name"
    };

    maker(users);
    $(".preview-mode").hide();
    $("#header").hide();
    $(".outside.data-list-toolbar").hide();
    $(".data-list-sidebar-wrap").hide();
    $(".data-list-content-wrap")[0].style.width = "100%";

    function maker(object) {
        var searchObjects = _.debounce(function () {
            $.get({
                url: object.url, 
                data: object.data(),
                dataType: object.dataType || "json"
            }).then(function (data) {
                var objects = data;
                var rows = "";
                objects.sort(object.comparer).forEach(o => rows += object.template(o));
                $(".data-list-table").html(`<thead>${object.headers}</thead>${rows}`);
                $("<tr colspan=1><td>Users</td></tr>").appendTo(".data-list-table").click(() => maker(users));
                $("<tr colspan=1><td>Groups</td></tr>").appendTo(".data-list-table").click(() => maker(groups));
            });
        }, 400);
        searchObjects();

        $(object.$search || ".data-list .data-list-toolbar")
            .html(`<input type='text' class='text-field-default' placeholder='${object.placeholder || "Search..."}' style='width: 250px'>`)
            .find("input")
            .keyup(function () {
                if (object.search == this.value || this.value.length < 2) return;
                object.search = this.value;
                searchObjects();
            }
        );
    }
}
)();