_What requests does the server and database need to handle?_

One database object with the following structure:

{
id: [number-unique-numeric-value],
createdAt: [string-date],
type: [string-episode/writing],
image: [string-image-url],
title: [string-title],
date: [string-date-published],
link: [string-audio-url],
text: [array-string-item-per-paragraph],
comments: [array-object-item-per-comment(name-date-text)]

}

POST

addNewPost

GET:

getAllPosts
getPostsByType
getPostById

PATCH

updatePostById

DELETE

deletePostById
