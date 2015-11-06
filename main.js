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
				'res/enemy1.png',
				'res/bullet2.png'
			]
			, function() {
				/**
				 * 游戏场景
				 * @type {void|*}
				 */
				var GameScene = cc.Scene.extend({
					_enemies: [],//敌机列表
					_enemyBullets: [],//敌机子弹
					_plane: null,//我方飞机
					_planeBullets: [],//我房子弹
					_gameLayer: null,
					_hitCount: 0,
					updateGame: function() {
						//我方子弹打中敌方飞机，敌方飞机和子弹消失
						var planeRect = this._plane.getBoundingBox();
						var _this = this;
						this._planeBullets.forEach(function(bullect) {
							var bulletRect = bullect.getBoundingBox();
							_this._enemies.forEach(function(enemy) {
								var enemyRect = enemy.getBoundingBox();
								if (cc.rectIntersectsRect(bulletRect, enemyRect)) {
									//移除敌方飞机和子弹
									_this._hitCount++;
									var enemyName = enemy.getTag();
									_this._enemies.splice(_this._enemies.indexOf(enemy), 1);
									_this._gameLayer.removeChild(enemy);
									_this._enemyBullets.forEach(function(enemyBullet) {
										if (enemyBullet.getTag().indexOf(enemyName) !== -1) {
											_this._enemyBullets.splice(_this._enemyBullets.indexOf(enemyBullet), 1);
											_this._gameLayer.removeChild(enemyBullet);
										}
									})
								}
							});
						});
						console.log(_this._hitCount);
						//敌方子弹打中我方飞机
					},
					onEnter: function() {
						this._super();
						var gameOver = false;
						var _this = this;
						//游戏层
						_this._gameLayer = new GameLayer();
						_this._gameLayer.init();
						this.addChild(_this._gameLayer);
						//添加飞机
						this._plane = new PlaneSprite();
						_this._gameLayer.addChild(this._plane);
						//子弹
						var fireBullet = function() {
							//cc.log('fireBullet');
							if (gameOver) {
								return;
							}
							var bullet = new PlaneBulletSprite();
							var planeBulletSpeed = 2;
							bullet.setPosition(_this._plane.getPosition().x + 51, 126 + 15);
							bullet.schedule(function() {
								this.setPosition(this.getPosition().x, this.getPosition().y + planeBulletSpeed);
								if (this.getPosition().x < 0 || this.getPosition().x > 320 - 5 / 2 || this.getPosition().y > 504) {
									_this._planeBullets.splice(_this._planeBullets.indexOf(this), 1);
									_this._gameLayer.removeChild(this);
								}
							}, 0, null, 0);
							_this._gameLayer.addChild(bullet);
							_this._planeBullets.push(bullet);
						};
						this.schedule(fireBullet, 0.3, null, 0);
						//敌机
						var enemyPlaneAction = function() {
							//cc.log('enemyPlane');
							if (gameOver) {
								return;
							}
							var enemyPlane = new EnemyPlaneSprite();
							var enemyPlaneSpeed = 1;
							var originX = Math.random();
							enemyPlane.setTag('enemy-' + Math.random());
							enemyPlane.setPosition(originX * 320, 480);
							enemyPlane.schedule(function() {
								this.setPosition(this.getPosition().x, this.getPosition().y - enemyPlaneSpeed);
								if (this.getPosition().x < 0 || this.getPosition().x > 320 - 5 / 2 || this.getPosition().y < 0) {
									_this._enemies.splice(_this._enemies.indexOf(this), 1);
									_this._gameLayer.removeChild(this);
								}
							}, 0, null, 0);
							//敌机生成子弹
							enemyPlane.schedule(function() {
								var bullet = new EnemyPlaneBulletSprite();
								var bulletSpeed = 2;
								bullet.setPosition(this.getPosition().x + 57 / 2, this.getPosition().y);
								//敌机子弹动作
								bullet.schedule(function() {
									bullet.setPosition(bullet.getPosition().x, bullet.getPosition().y - bulletSpeed);
									if (bullet.getPosition().x < 0 || bullet.getPosition().x > 320 - 5 / 2 || bullet.getPosition().y > 504 || bullet.getPosition().y < 0) {
										_this._enemyBullets.splice(_this._enemyBullets.indexOf(bullet), 1);
										_this._gameLayer.removeChild(bullet);
									}
								}, 0, null, 0);
								_this._gameLayer.addChild(bullet);
								bullet.setTag('enemybullet-' + enemyPlane.getTag());
								_this._enemyBullets.push(bullet);
							}, 1, null, 0);
							_this._gameLayer.addChild(enemyPlane);
							_this._enemies.push(enemyPlane);
						};
						this.schedule(enemyPlaneAction, 2, null, 0);
						// 更新游戏
						this.schedule(this.updateGame);
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
								//cc.log('on touch began');
								return true;
							},
							onTouchMoved: function(touch, event) {
								//cc.log('on touch move');
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
						this.setAnchorPoint(0, 0);
					}
				});
				/**
				 * 敌机子弹
				 * @type {void|*}
				 */
				var EnemyPlaneBulletSprite = cc.Sprite.extend({
					ctor: function() {
						this._super();
						this.initWithFile('res/bullet2.png');
					}
				});
				cc.director.runScene(new GameScene);
			}, this);
	};
	cc.game.run("gameCanvas");
};