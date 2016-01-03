# Note

Note is a JavaScript library to create simple note application.([Demo](http://vsanna.github.io/notejs/))


```js
new Note.({selector:'#main'}).run()
```

### sample gif(using sample.html)
![](/images/sample1.gif)


### after styling(using index.html)
![](/images/sample2.gif)

## how to use
You have to place some elements to use note.js.  
After that,  you just have to create an instance. That's all.

1. editor area    ... ex: #main
  - you can change this ID.
2. menu area    ...  #menu
3. button to create new note    ...  .btn_create
4. showing noteID area   ... .edittingKey

here is sample.html.

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>note.js</title>
</head>
<body>
  <ul id="menu"></ul>
  <p class="edittingKey"></p>
  <button class="btn_create">create</button>
  <div id="main"></div>


  <script type="text/javascript" src="note.js"></script>
  <script type="text/javascript">
    new Note({ selector: '#main'}).run();
  </script>
</body>
</html>

```

## TODO
- add shortcut
- make selector-name optional
- add title
