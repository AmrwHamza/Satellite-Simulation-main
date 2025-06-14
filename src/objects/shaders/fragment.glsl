precision mediump float;           // ضروري

uniform sampler2D globeTexture;

varying vec2 vertexUV;
varying vec3 vertexNormal;


void main(){
float intensity=1.02-dot(vertexNormal,vec3(0.0,0.0,1.0));
vec3 atmosphere= vec3(0.2,0.4,0.8)*pow(intensity,1.0);

gl_FragColor=vec4(atmosphere+texture2D(globeTexture,vertexUV).xyz,1.0);
}