uniform float uTime;
uniform float uPositionFrequency;
uniform float uTimeFrequency;
uniform float uStrength;
uniform float uWarpPositionFrequency;
uniform float uWarpTimeFrequency;
uniform float uWarpStrength;
uniform float uAudioLevel;
uniform float uBassLevel;
uniform float uMidLevel;

#include ../includes/simplexNoise4d.glsl

attribute vec4 tangent;

varying float vWobble;

float getWobble(vec3 position)
{
    float warpTimeFreq = uWarpTimeFrequency * (0.5 + uMidLevel);
    float mainTimeFreq = uTimeFrequency * (0.5 + uMidLevel);

    vec3 warpedPosition = position;
    warpedPosition += simplexNoise4d(
        vec4(
            position * warpTimeFreq,
            uTime * mainTimeFreq * 0.01
        )
    ) * uWarpStrength  * uAudioLevel;

    return simplexNoise4d(vec4(
        warpedPosition * uPositionFrequency,
        uTime * uTimeFrequency
    )) * uStrength * uAudioLevel;
}

void main()
{
    vec3 biTangent = cross(normal, tangent.xyz);

    // Neighbours positions
    float shift = 0.1;
    vec3 positionA = csm_Position + tangent.xyz * shift;
    vec3 positionB = csm_Position + biTangent * shift;

    // Wobble
    float wobble = getWobble(csm_Position);
    float bassfactor = 0.3 + uBassLevel * 1.0;
    wobble *= bassfactor;

    csm_Position += wobble * normal;
    positionA    += getWobble(positionA) * normal;
    positionB    += getWobble(positionB) * normal;

    vec3 toA = normalize(positionA - csm_Position);
    vec3 toB = normalize(positionB - csm_Position);
    csm_Normal = cross(toA, toB);

    // varying
    vWobble = wobble / uStrength;
}