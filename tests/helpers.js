var tweetObj = {
    "created_at":"Mon Jun 09 14:08:17 +0000 2014",
    "id":476002849004859400,
    "id_str":"476002849004859392",
    "text":"RT @occupycorruptDC: #Cruz: '#Obama's #Lawlessness' Responsible for Spike in #Illegal #Immigration. #IMPEACH NOW! http://t.co/PiEAmLWYf3 ht…",
    "source":"<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>",
    "truncated":false,
    "in_reply_to_status_id":null,
    "in_reply_to_status_id_str":null,
    "in_reply_to_user_id":null,
    "in_reply_to_user_id_str":null,
    "in_reply_to_screen_name":null,
    "user":{
        "id":234581403,
        "id_str":"234581403",
        "name":"Lamarre",
        "screen_name":"sportymom5n2",
        "location":"south florida",
        "url":null,
        "description":"When the people fear the government, there is tyranny.  When the government fears the people, there is freedom! Love God and liberty? Expose corruption in DC.",
        "protected":false,
        "verified":false,
        "followers_count":176,
        "friends_count":332,
        "listed_count":3,
        "favourites_count":6,
        "statuses_count":1329,
        "created_at":"Thu Jan 06 00:50:34 +0000 2011",
        "utc_offset":null,
        "time_zone":null,
        "geo_enabled":false,
        "lang":"en",
        "contributors_enabled":false,
        "is_translator":false,
        "profile_background_color":"C0DEED",
        "profile_background_image_url":"http://abs.twimg.com/images/themes/theme1/bg.png",
        "profile_background_image_url_https":"https://abs.twimg.com/images/themes/theme1/bg.png",
        "profile_background_tile":false,
        "profile_link_color":"0084B4",
        "profile_sidebar_border_color":"C0DEED",
        "profile_sidebar_fill_color":"DDEEF6",
        "profile_text_color":"333333",
        "profile_use_background_image":true,
        "profile_image_url":"http://pbs.twimg.com/profile_images/3036225285/7c2705ebb7e95aaec29fffd7bba9c8ae_normal.jpeg",
        "profile_image_url_https":"https://pbs.twimg.com/profile_images/3036225285/7c2705ebb7e95aaec29fffd7bba9c8ae_normal.jpeg",
        "default_profile":true,
        "default_profile_image":false,
        "following":null,
        "follow_request_sent":null,
        "notifications":null
    },
    "geo":null,
    "coordinates":null,
    "place":null,
    "contributors":null,
    "entities":{
        "hashtags":[
            {
                "text":"Cruz",
                "indices":[0,5]
            },
            {
                "text":"Obama",
                "indices":[8,14]
            },
            {
                "text":"Lawlessness",
                "indices":[17,29]
            },
            {
                "text":"Illegal",
                "indices":[56,64]
            },
            {
                "text":"Immigration",
                "indices":[65,77]
            },
            {
                "text":"IMPEACH",
                "indices":[79,87]
            }
        ],
        "trends":[],
        "urls":[
            {
                "url":"http://t.co/PiEAmLWYf3",
                "expanded_url":"http://www.breitbart.com/Breitbart-Texas/2014/06/06/Ted-Cruz-Obamas-Lawlessness-Responsible-for-Spike-in-Illegal-Immigration",
                "display_url":"breitbart.com/Breitbart-Texa…",
                "indices":[93,115]
            }
        ],
        "user_mentions":[],
        "symbols":[],
        "media":[
            {
                "id":476002475783516160,
                "id_str":"476002475783516160",
                "indices":[116,138],
                "media_url":"http://pbs.twimg.com/media/BpsZutFIcAAa6uZ.jpg",
                "media_url_https":"https://pbs.twimg.com/media/BpsZutFIcAAa6uZ.jpg",
                "url":"http://t.co/9TjmUw78Nf",
                "display_url":"pic.twitter.com/9TjmUw78Nf",
                "expanded_url":"http://twitter.com/occupycorruptDC/status/476002476924346368/photo/1",
                "type":"photo",
                "sizes":{
                    "thumb":{"w":150,"h":150,"resize":"crop"},
                    "small":{"w":340,"h":191,"resize":"fit"},
                    "medium":{"w":599,"h":337,"resize":"fit"},
                    "large":{"w":1024,"h":576,"resize":"fit"}
                }
            }
        ]
    },
    "favorited":false,
    "retweeted":false,
    "possibly_sensitive":false,
    "filter_level":"low",
    "lang":"en"
};

var responseTypes = {
    success: {
        message: 'Added to "Favorites".',
        bootstrapClass: 'success',
        type: 'ok'
    },

    error: {
        message: 'Adding to "Favorites" failed.',
        bootstrapClass: 'danger',
        type: 'error'
    },

    notEnoughSpace: {
        message: 'You don\'t have enough space in the browser local storage.',
        bootstrapClass: 'warning',
        type: 'error'
    },

    deleteSuccess: {
        message: 'Removed from "Favorites".',
        bootstrapClass: 'success',
        type: 'ok'
    },

    deleteError: {
        message: 'Removing from "Favorites" failed.',
        bootstrapClass: 'danger',
        type: 'error'
    },

    deleteAllSuccess: {
        message: 'All from "Favorites" is removed.',
        bootstrapClass: 'success',
        type: 'ok'
    },

    deleteAllError: {
        message: 'Removing all from "Favorites" failed.',
        bootstrapClass: 'danger',
        type: 'error'
    }
};
