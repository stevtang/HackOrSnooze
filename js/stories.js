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

async function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  const userFavorites = await User.getFavorites();
  const userFavoriteObj = {};

  //Creates object of user favorited stories with storyId as key and value as null
  for (let story of userFavorites.stories) {
    userFavoriteObj[story.storyId] = null;
  }

  /**Calls functino to generate html markup, appends to allStoriesList element. 
   * Check if StoryId is in previously created object of favorite stories and
   * toggles fas class if so.
  */
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);

    $allStoriesList.append($story);

    if (story.storyId in userFavoriteObj) {
      $(`#star-${story.storyId}`).toggleClass("fas favorite");
    }

  }

  $allStoriesList.show();
}

/** Gets form values, calls addStory method, prepends to the $allStoriesList */

async function getStoryValueAndUpdateStoryList() {
  //subnitNewStory
  //input sounds like the HTML element, can remove
  const author = $("#author-input").val();
  const title = $("#title-input").val();
  const url = $("#url-input").val();

  //remove quotes, not necessary
  // should just be passing {authoer, title, url}
  const newStory = {
    token: currentUser.loginToken,
    story: {
      //can use object shorthand if we fix const variables above
      author,
      title,
      url,
    },
  };

  const newStoryPost = await storyList.addStory(currentUser, newStory);

  const $jqueryStory = generateStoryMarkup(newStoryPost);

  $allStoriesList.prepend($jqueryStory);
}

//Code Review Thursday - add event to the form itself and listen for a submit. will not detect hitting enter key.
$("#add-new-story-form").on("submit", getStoryValueAndUpdateStoryList);

/** Checking the closest li element of clicked star for storyId. Toggles
 * the class of the element that has the same storyId.
 */

function favoriteToggle(evt) {

  let favoriteStory;

  const closestParent = $(evt.target).closest("li");
  const closestParentId = closestParent[0].id;

  /** Loop may not be necessary. Can probably just grab the parent
   * without comparing storyId's.
   */
  for (let story of storyList.stories) {
    if (closestParentId === story.storyId) {
      favoriteStory = story;
    }
  }

  if ($(`#star-${favoriteStory.storyId}`).hasClass("favorite")) {
    currentUser.unfavorite(favoriteStory);
    $(`#star-${favoriteStory.storyId}`).toggleClass("fas favorite");
  } else {
    currentUser.addFavorite(favoriteStory);
    $(`#star-${favoriteStory.storyId}`).toggleClass("fas favorite");
  };
}

$("#all-stories-list").on("click", ".fa-star", favoriteToggle);