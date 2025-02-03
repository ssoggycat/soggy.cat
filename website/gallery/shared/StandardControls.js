import {PointerLockControls} from 'PointerLockControls';
import {
	Euler,
	Vector3
} from 'three'; //TODO: USE THESE!!! INSTEAD OF MOVEFORWARD AND MOVERIGHT SINCE THOSE ARE STUPID!!!!

function getControlDir(eventCode,controls,controlMap) {
	if (!controls.hasOwnProperty(eventCode)) return;

	const control = controls[eventCode];
	const directions = controlMap[control][0][2]; //hardcoded movement for testing

	const addedVel = new Vector3(directions[0],directions[1],directions[2]);
	return [control,directions,addedVel];
};

class StandardControls extends PointerLockControls {

	constructor( camera, domElement ) {
		super(camera, domElement);

		this.velocity = new Vector3(0,0,0);

		this.motionTarget = [];
		this.acceleration = [];

		this.controls = {
			"KeyW": "forwards",
			"KeyS":"backwards",
		
			"KeyA":"left",
			"KeyD":"right"
		
			//"KeyE":"up",
			//"KeyR":"down",
		}; //best of the best for now, will probably switch out later

		this.controlMap = {
			"forwards": [
				["motionTarget","movement",[0,0,1]]
			],

			"backwards": [
				["motionTarget","movement",[0,0,-1]]
			],
		

			"left": [
				["motionTarget","movement",[-1,0,0]]
			],

			"right": [
				["motionTarget","movement",[1,0,0]]
			],
		
			"up": [
				["motionTarget","movement",[0,1,0]]
			],
			"down": [
				["motionTarget","movement",[0,-1,0]]
			],

			"jump": [
				["acceleration","jumping",[0,1,0]]
			],
			"crouch": [
				["scale.mult","crouching",[1,0.5,1]],
				["motion.scale","movement",[.5]]
			],
		};
		//again... best of the best. 
		//i really want an "up" for later, that determines the direction that these go
		//(so you could just climb up a wall! that'd be cool)

		addEventListener("click", (event) => {
			this.lock();
		});

		this.heldKeys = [];
		this.heldControls = [];
		addEventListener('keydown', (event) => {
			if (this.isLocked != true || this.heldKeys.indexOf(event.code) > -1) return;

			this.heldKeys.push(event.code);

			const controlData = getControlDir(event.code,this.controls,this.controlMap);
			if (!controlData) return;

			this.heldControls.push(controlData[0]);

			this.velocity.add(controlData[2]);
		});

		addEventListener('keyup', (event) => {
			if (this.isLocked != true) return;

			const indexOfKey = this.heldKeys.indexOf(event.code)
			if (indexOfKey > -1) {
				this.heldKeys.splice(indexOfKey,1);
			}

			const controlData = getControlDir(event.code,this.controls,this.controlMap);
			if (!controlData) return;
			
			const indexOfControl = this.heldControls.indexOf(controlData[0])
			if (indexOfControl > -1) {
				this.heldControls.splice(indexOfControl,1);
			}

			this.velocity.sub(controlData[2]);
	});	
	}

	updateMovement(delta,delta_mult = 60) {
		const camera = this.camera;

		this.moveForward(this.velocity.z*(delta*delta_mult));
		this.moveRight(this.velocity.x*(delta*delta_mult));
		camera.position.addScaledVector(new Vector3(0,this.velocity.y,0),delta*delta_mult);
	}
};

export { StandardControls };