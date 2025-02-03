// modified for soggy.cat but i didn't bother with changing the name... 
// this probably sucks really bad but it looks cool!

(function(Blotter) {
	Blotter.LiquidDistortMaterial = function() {
		Blotter.Material.apply(this, arguments);
	};

	Blotter.LiquidDistortMaterial.prototype = Object.create(Blotter.Material.prototype);

	Blotter._extendWithGettersSetters(Blotter.LiquidDistortMaterial.prototype, (function () {
		function _mainImageSrc () {
			var mainImageSrc = [
				Blotter.Assets.Shaders.Noise3D,
				Blotter.Assets.Shaders.Random,

				`
				vec2 randomVec2(vec2 uv) {
					return (vec2(random(uv), random(uv + 100.0)) - vec2(0.5,0.5)) * .005;
				}

				void mainImage( out vec4 mainImage, in vec2 fragCoord )
				{
				    // Setup ========================================================================

				    vec2 uv = fragCoord.xy / uResolution.xy;
				    float z = uSeed + uGlobalTime * uSpeed;

					vec2 redUV = uv + (
					snoise(vec3(uv, z))
					+ snoise(vec3(uv * 2.0, (z + 200.0)))
					+ snoise(vec3(uv * 4.0, (z + 400.0)))
					+ snoise(vec3(uv * 8.0, (z + 800.0) * 2.0))
					) * (uVolatility / 4.0);

					z += 0.04;
					vec2 greenUV = uv + (
					snoise(vec3(uv, z))
					+ snoise(vec3(uv * 2.0, (z + 200.0)))
					+ snoise(vec3(uv * 4.0, (z + 400.0)))
					+ snoise(vec3(uv * 8.0, (z + 800.0) * 2.0))
					) * (uVolatility / 4.0);

					z += 0.04;
					vec2 blueUV = uv + (
					snoise(vec3(uv, z))
					+ snoise(vec3(uv * 2.0, (z + 200.0)))
					+ snoise(vec3(uv * 4.0, (z + 400.0)))
					+ snoise(vec3(uv * 8.0, (z + 800.0) * 2.0))
					) * (uVolatility / 4.0);

					vec4 redCheck = textTexture(redUV + randomVec2(uv));
					vec4 greenCheck = textTexture(greenUV + randomVec2(uv));
					vec4 blueCheck = textTexture(blueUV + randomVec2(uv));

					float abberation = abs(redCheck.r - ((greenCheck.r + blueCheck.r) / 2.0)) * max(max(redCheck.a, greenCheck.a), blueCheck.a) / 1.0;

					vec2 redA = textTexture(redUV).ra;
					vec2 greenA = textTexture(greenUV).ga;
					vec2 blueA = textTexture(blueUV).ba;

					vec4 distortedImage = vec4(redA.r, greenA.r, blueA.r, max(max(redA.g, greenA.g), blueA.g));
					vec4 noisyImage = vec4(redCheck.r, greenCheck.g, blueCheck.b, max(max(redCheck.a, greenCheck.a), blueCheck.a));
					mainImage = mix(distortedImage, noisyImage, clamp(abberation * 2.0,0.0,1.0));
			 	}
				`
			].join("\n");

			return mainImageSrc;
		}

		return {

			constructor : Blotter.LiquidDistortMaterial,

			init : function () {
				this.mainImage = _mainImageSrc();
				this.uniforms = {
					uSpeed : { type : "1f", value : 1.0 },
					uVolatility : { type : "1f", value : 0.15 },
					uSeed : { type : "1f", value : 0.1 }
				};
			}
		};

	})());

})(
	this.Blotter
);
