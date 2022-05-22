// ==UserScript==
// @name        KnowYourVote (KnowYourMeme)
// @namespace   https://github.com/neatcrown/
// @supportURL  https://github.com/neatcrown/kym-userscripts/issues
// @icon        https://github.com/neatcrown/kym-userscripts/raw/master/src/knowyourvote.png
// @version     0.4.1
// @description Adds a countdown timer to Know Your Meme's vote limiter and prevents you from voting before the countdown is over.
// @author      NeatCrown
// @match       https://*.knowyourmeme.com/*
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-start
// ==/UserScript==

/* globals jQuery, $ */

'use strict';

//================================================================================
//#region CONSTANTS

const TIMEOUT_MS = 8600;
const UPDATE_INTERVAL_MS = 100;

//#endregion CONSTANTS

//================================================================================
//#region STYLES

GM_addStyle(`
  .vote-timer {
    position: absolute;
    width:100%;
    height:100%;
    top:0;
    color: #9f1c27;
    font-weight:bold;
  }
  .time-left {
    position: absolute;
    font-size:12px;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-40%);
  }
  .thumbs-cover {
    position: absolute;
    top:0;
    left:0;
    width: 100%;
    height: 100%;
    opacity: 66.66%;
  }
  .thumbs {
    position: relative;
  }
`);

//#endregion CSS

//================================================================================
//#region VOTING

var vote_timeout;
var intervalfn;

//returns the voter with the current timer value
function getCover() {
    return `` +
     `<div class='vote-timer'>` +
       `<img class='thumbs-cover' src='/assets/loading_animation.gif' alt='Waiting...' title='Voting disabled until the timer runs out.'/>` +
       `<div class='time-left'>` + timeStr() + `</div>` +
     `</div>`;
}

//returns the time left as a string to a 10th of a second
function timeStr() {
    return ((vote_timeout - Date.now()) / 1000).toFixed(1);
};

//called each interval to decrease the counter
function countdown() {
    let time_left = vote_timeout - Date.now();
    if(time_left <= 0) {
        //stops the interval and removes all timers
        clearInterval(intervalfn);
        $('.vote-timer').remove();
        vote_timeout = 0;
        return;
    }
    //displays the given time
    $('.time-left').text(timeStr(time_left));
}

//appends timers to the page if needed
function appendTimers() {
    clearInterval(intervalfn);
    if(vote_timeout - Date.now() > 0) {
        $('.thumbs:not(:has(.vote-timer))').append(getCover());
    }
    intervalfn = setInterval(countdown, UPDATE_INTERVAL_MS);
}

//synchronises votes count between top and list comments
function syncComments($btn) {
    //if voting for image, don't do anything.
    if($btn.parent().hasClass('header')) return;
    //fetches the voted comment's id
    let comment_id = $btn.parents().eq(3).attr('id');
    //replace unvoted thumb with voted thumb
    let comment_types = $btn.parents().eq(4).is('#top-comments') ? ['#top-comments', '#comments-list'] : ['#comments-list', '#top-comments'];
    let clicked_thumbs = $(comment_types[0]).find('#' + comment_id).find('.comment-bottom-bar');
    let other_thumbs = $(comment_types[1]).find('#' + comment_id).find('.comment-bottom-bar');
    other_thumbs.html(clicked_thumbs.html());
};

//#endregion TIMER COVER

//================================================================================
//#region LISTENERS

//on page show. covers top comments and image votes
window.addEventListener('pageshow', function() {
    if(vote_timeout - Date.now() > 0) {
        $('#top-comments').find('.thumbs').append(getCover());
    }
});

//on page load. needed so that listeners are added
window.addEventListener('DOMContentLoaded', function() {
    /*//on top comments load. fails to trigger for some reason.
    //keeping this commented out instead of deleting it because i felt like it.
    //also to show that the site is kinda broken
    $(document).on('comments-loaded', '#top-comments', function() {
        if(vote_timeout - Date.now() > 0) {
            $(this).find('.thumbs').append(getCover());
        }
    });*/
    //on comments list load
    $(document).on('comments-loaded', '#comments-list', function() {
        if(vote_timeout - Date.now() > 0) {
            $(this).find('.thumbs').append(getCover());
        }
    });
    //on vote
    $(document).on('click', '.thumb:not(.grey):not(.count)', function() {
        vote_timeout = Date.now() + TIMEOUT_MS;
        GM_setValue('vote_timeout', vote_timeout);
        appendTimers();

        syncComments($(this))
    });
    //on image in gallery opened
    $('#cboxContent').on('DOMNodeInserted', '#cboxLoadedContent', function() {
        if(vote_timeout - Date.now() > 0) {
            $(this).find('.thumbs:not(:has(.vote-timer))').append(getCover());
        }
    });
});

//on page focus (window/tab change)
window.addEventListener('focus', function() {
    vote_timeout = GM_getValue('vote_timeout', 0);
    appendTimers();
});

//#endregion LISTENERS
