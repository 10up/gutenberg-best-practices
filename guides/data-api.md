# A Complete Guide to the WordPress Data API

<details>
<summary>Background</summary>

The Data API in WordPress is used to manage the global application state within the editor. It is a wrapper around the popular state management library [Redux](https://redux.js.org).  
</details>

<details>
<summary>Basics and terminology</summary>

![Redux API Design](/img/redux-api-design.png)

In redux and therefore in the WordPress Data API there is the concept of a Store that manages the global application state. This global state can only be updated by dispatching actions on the store. These actions will then get consumed by reducers to determine what the next version of the state should look like. If you want to access the state you can subscribe to the store and receive the value of the current state every time it is being updated. 

![Redux API Design Simplified](/img/redux-api-design-simplified.png)
</details>