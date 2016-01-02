/*
# javascriptライブラリの練習

1. 指定したDOMを編集可能(contentEditable)にする
2. 押下したkeyCodeをconsoleに流す
3. localStorageへの保存と読み出し
4. 初期読み出しができる. また、初期読み出しにおいて直前に編集していたテキストを読み出せる
4. 2を元にショートカットを表示
*/

// 書き方1 クロージャーにしたうえでconstructorを返す
// var TestModule = (function(){
//   var constructor = function(config){
//     this.selector = config.selector
//   }
//
//   constructor.prototype.run = function(){
//     findEditableArea.call(this)
//     makeEditableArea.call(this)
//     showWitchKeyIsPressing.call(this)
//   }
//
//   var findEditableArea = function(){
//     this.editableArea = document.querySelector(this.selector)
//     console.log(this)
//   }
//   var makeEditableArea = function(){
//     this.editableArea.contentEditable = true
//   }
//
//   ... 一部省略
//
//   var showWitchKeyIsPressing = function(){
//     this.editableArea.addEventListener('keypress', function(e){ console.log(e.keyCode) })
//   }
//
//   return constructor
// })()


// 書き方2 オーソドックス.
var OrenoEditor = function(config){
  this.selector = config.selector
  this.edittingKey = (localStorage.edittingKey) ? localStorage.edittingKey : 'testString1'
  this.articleKeys = [];

  this.MAX_ARTICLE_NUM = 20;

}

OrenoEditor.prototype = {
  run: function(){
    // このthisはrunを呼び出したインスタンス

    // 書き方1
    // インスタンスは直接はこのメソッドを持たないため、this.__proto__(==TestModule.prototype)を見に行っている.
    // なお、呼び出した関数内でのthisは関数呼び出しを行ったインスタンスそのものなので問題なし
    this.findEditableArea();
    this.makeEditableArea();
    this.makeMenu();
    this.readInitText();
    this.makeButtonToCreateNewArticle();
    this.makeButtonToSave();

    this.showWitchKeyIsPressed();
    // this.renderMD();

    // 書き方2
    // this.__proto__を明示的に書いたもの. 普段使いしない
    // this.__proto__は、継承元.prototypeへの暗黙のリンク
    // 呼び出しがTestModule.prototypeになってしまっているので, call(this)をして、ここでのthis = runを実行したインスタンスをbindしている
    // TestModule.prototype.findEditableArea.call(this); // TestModule.prototype.findEditableArea()は当然エラー
    // TestModule.prototype.makeEditableArea.call(this);
    // TestModule.prototype.showWitchKeyIsPressing.call(this);

    // 書き方3
    // もちろんこんな書き方はしない
    // この時、関数を呼び出しているのが、this.__proto__(===TestModule)であるため、よびだした関数内でのthisがインスタンスを示さない。
    // よって、ここでのthis = runを実行したインスタンスをcallでbindしている
    // this.__proto__.findEditableArea.call(this);
    // this.__proto__.makeEditableArea.call(this);
    // this.__proto__.showWitchKeyIsPressing.call(this);
  },
  findEditableArea: function(){
    this.editableArea = document.querySelector(this.selector)
  },
  makeEditableArea: function(){
    this.editableArea.contentEditable = true
  },
  makeMenu: function(){
    this.formatMenu();
    this.readKeysFromStorage();
    for( var index in this.articleKeys ){
      this.createButton(this.articleKeys[index], this.articleKeys[index].replace(/testString/,''));
    }
  },
  readInitText: function(){
    if( this.edittingKey && localStorage[this.edittingKey] ){
      this.editableArea.innerHTML = localStorage[this.edittingKey]
    }
  },
  makeButtonToSave: function(){
    this.editableArea.addEventListener('keyup', (function(){
      localStorage.setItem(this.edittingKey, this.editableArea.innerHTML);
    }).bind(this)) // bind(this)することで、イベント付与時に、thisがDOM要素になることを回避!非常に便利
  },
  makeButtonToCreateNewArticle: function(){
    document.querySelector('#create').addEventListener('click', (function(){
      if(this.maxArticleNum > this.MAX_ARTICLE_NUM){
        alert('記事は100以上作成できません')
        return
      }
      var randID = Math.round(Math.random()*100000000000000);
      localStorage.setItem('testString'+randID,'');
      this.switchText('testString' + randID)
      this.makeMenu();
    }).bind(this))
  },

  // 以下切り出したメソッド
  formatMenu: function(){
    // 初期化
    if( this.articleKeys.length > 0){
      this.removeChildren(document.querySelector('#menu'))
      this.articleKeys = []
    }
  },
  removeChildren: function(node){
    var nodes = node.children
    for(var i = nodes.length-1; i >= 0; i--){
      node.removeChild(nodes[i])
    }
  },
  readKeysFromStorage: function(){
    var keys = []
    for(var prop in localStorage){
      // testStringから始まるkeyのみ取得
      if( /^testString/.test(prop) ){
        keys.push(prop)
      }
    }
    this.articleKeys = keys;
  },
  createButton: function(index){
    // メニューにボタンを追加.
    var textNode = document.createTextNode('テキストその' + String(index));
    var btn = document.createElement('button');
    var li = document.createElement('li')

    li.appendChild(btn);
    btn.appendChild(textNode);

    var dataKey = index;
    btn.setAttribute('data-key', dataKey);
    document.getElementById('menu').appendChild(li);

    // ボタンにイベント付与
    btn.addEventListener('click', this.switchText.bind(this, dataKey));
    // call, applyは関数の『実行』
    // bindは関数内のthisと引数を固定した関数を返す
    // method.bind(thisの指すobj, param1, ...)

    var deleteBtn = document.createElement('button')
    deleteBtn.appendChild(document.createTextNode('delete'));
    deleteBtn.setAttribute('data-key', dataKey);
    li.appendChild(deleteBtn);

    deleteBtn.addEventListener('click', this.deleteText.bind(this, dataKey))
  },

  // 以下エディターの操作
  switchEdittingKey: function(key){
    document.querySelector('.edittingKey').innerHTML = key
    this.edittingKey = key
    localStorage.setItem("edittingKey", this.edittingKey);
  },
  switchText: function(key){
    this.switchEdittingKey(key)
    this.editableArea.innerHTML = localStorage[key]
    document.querySelector('#editor').focus()
  },
  deleteText(key){
    if( confirm('really?') ){
      delete localStorage[key]
      this.makeMenu();
      this.switchText(this.articleKeys[0]);
    }
  },


  saveToServer: function(){
    // いずれrailsに送る
    // keyupで送ると通信がパンクするのでintervalおいてセーブする
  },
  showWitchKeyIsPressed: function(){
    // 取得したkeyCodeを元にショートカットを定義づける(いずれ)
    this.editableArea.addEventListener('keypress', function(e){ console.log(e.keyCode) })
  },

}



/*
TODO
- ユーザーが入力したmarkdownをHTMLにレンダリング
- keyCodeを元にショートカットの提供
*/
