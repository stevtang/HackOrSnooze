"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  // console.log("story", story);
  const hostName = story.getHostName();
  return $(`
  
      <li id="${story.storyId}">
      <i id="star-${story.storyId}" class="far fa-star"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Gets form values, calls addStory method, prepends to the $allStoriesList */

async function getStoryValueAndUpdateStoryList() {
  //subnitNewStory
  //input sounds like the HTML element, can remove
  const authorInput = $("#author-input").val();
  const titleInput = $("#title-input").val();
  const urlInput = $("#url-input").val();

  //remove quotes, not necessary
  // should just be passing {authoer, title, url}
  const newStory = {
    token: currentUser.loginToken,
    story: {
      //can use object shorthand if we fix const variables above
      author: authorInput,
      title: titleInput,
      url: urlInput,
    },
  };

  const newStoryPost = await storyList.addStory(currentUser, newStory);

  const $jqueryStory = generateStoryMarkup(newStoryPost);

  $allStoriesList.prepend($jqueryStory);
}

function favoriteToggle(evt) {

  let favoriteStory;

  const closestParent = $(evt.target).closest("li");
  const closestParentId = closestParent[0].id;

  for (let i of storyList.stories){
    if (closestParentId === i.storyId) {
      favoriteStory = i;
      console.log("story from loop, ", favoriteStory);
    }
  }

  if ($(`#star-${favoriteStory.storyId}`).hasClass("favorite")) {
    currentUser.unfavorite(favoriteStory);
  } else {
    currentUser.favorite(favoriteStory);

  };
}
//add event to the form itself and listen for a submit. will not detect hitting enter key.
$("#add-new-story-button").on("click", getStoryValueAndUpdateStoryList);

$("#all-stories-list").on("click", ".fa-star", favoriteToggle);

// $(`#star-${this.storyId}`).on("click",  favoriteToggle);
