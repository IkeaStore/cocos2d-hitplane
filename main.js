/**
 * @author xialeistudio<home.xialei@gmail.com>
 */
window.onload = function() {
	cc.game.onStart = function() {
		cc.view.adjustViewPort(true);
		cc.view.setDesignResolutionSize(320, 504, cc.ResolutionPolicy.SHOW_ALL);
		cc.view.resizeWithBrowserSize(true);
		//load resources
		cc.LoaderScene.preload(
			[
				'res/background.png',
				'res/hero1.png',
				'res/bullet1.png',
				'res/enemy1.png'
			]
			, function() {
				/**
				 * 游戏场景
				 * @type {void|*}
				 */
				var GameScene = cc.Scene.extend({
					onEnter: function() {
						this._super();
						var gameOver = false;
						//游戏层
						var gameLayer = new GameLayer();
						gameLayer.init();
						this.addChild(gameLayer);
						//添加飞机
						var plane = new PlaneSprite();
						gameLayer.addChild(plane);
						//子弹
						var fireBullet = function() {
							cc.log('fireBullet');
							if (gameOver) {
								return;
							}
							var bullet = new PlaneBulletSprite();
							var planeBulletSpeed = 2;
							bullet.setPosition(plane.getPosition().x + 51, 126 + 15);
							bullet.schedule(function() {
								this.setPosition(this.getPosition().x, this.getPosition().y + planeBulletSpeed);
								if (this.getPosition().x < 0 || this.getPosition().x > 320 - 5 / 2 || this.getPosition().y > 504) {
									gameLayer.removeChild(this);
								}
							}, 0, null, 0);
							gameLayer.addChild(bullet);
						};
						this.schedule(fireBullet, 0.3, cc.REPEAT_FOREVER, 0);
						var enemyPlaneAction = function() {
							cc.log('enemyPlane');
							if (gameOver) {
								return;
							}
							var enemyPlane = new EnemyPlaneSprite();
							var enemyPlaneSpeed = 2;
							var originX = Math.random();
							enemyPlane.setPosition(originX * 320, 480);
							enemyPlane.schedule(function() {
								this.setPosition(this.getPosition().x, this.getPosition().y - enemyPlaneSpeed);
								if (this.getPosition().x < 0 || this.getPosition().x > 320 - 5 / 2 || this.getPosition().y < 0) {
									gameLayer.removeChild(this);
								}
							}, 0, null, 0);
							gameLayer.addChild(enemyPlane);
						};
						this.schedule(enemyPlaneAction, 1, cc.REPEAT_FOREVER, 0);
					}
				});
				/**
				 * 游戏层
				 * @type {void|*}
				 */
				var GameLayer = cc.Layer.extend({
					init: function() {
						this._super();
						var layer = cc.Layer.create();
						//添加背景
						var bg = cc.Sprite.create('res/background.png');
						bg.setAnchorPoint(0, 0);
						bg.setPosition(0, 0);
						layer.addChild(bg);
						this.addChild(layer);
						return true;
					}
				});
				/**
				 * 飞机
				 * @type {void|*}
				 */
				var PlaneSprite = cc.Sprite.extend({
					ctor: function() {
						this._super();
						var size = cc.director.getWinSize();
						this.initWithFile('res/hero1.png');
						this.setAnchorPoint(0, 0);
						this.setPosition(size.width / 2 - 51, 0);
						var _this = this;
						//注册事件
						var listener = cc.EventListener.create({
							event: cc.EventListener.TOUCH_ONE_BY_ONE,
							swallowTouches: true,
							onTouchBegan: function(touch, event) {
								cc.log('on touch began');
								return true;
							},
							onTouchMoved: function(touch, event) {
								cc.log('on touch move');
								var point = touch.getLocation();
								//边界监测
								if (point.x > size.width - 102) {
									point.x = size.width - 102;
								}
								if (point.x < 0) {
									point.x = 0;
								}
								_this.setPositionX(point.x);
							},
							onTouchEnded: function(touch, event) {
							}
						});
						cc.eventManager.addListener(listener, this);
					}
				});
				/**
				 * 飞机子弹
				 * @type {void|*}
				 */
				var PlaneBulletSprite = cc.Sprite.extend({
					ctor: function() {
						this._super();
						//var size = cc.director.getWinSize();
						this.initWithFile('res/bullet1.png');
					}
				});
				/**
				 * 敌机
				 * @type {void|*}
				 */
				var EnemyPlaneSprite = cc.Sprite.extend({
					ctor: function() {
						this._super();
						this.initWithFile('res/enemy1.png');
					}
				});
				cc.director.runScene(new GameScene);
			}, this);
	};
	cc.game.run("gameCanvas");
};