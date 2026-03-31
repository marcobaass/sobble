uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uHighLevel;

varying float vWobble;

void main()
{
    float colorMix = smoothstep(-1.0, 1.0, vWobble);
    float highBoost = uHighLevel;
    float finalMix = clamp(colorMix + highBoost * 0.3, 0.0, 1.0);
    csm_DiffuseColor.rgb = mix(uColorA, uColorB, finalMix);

    // Shiny tip
    float roughnessBase = 1.0 - colorMix;
    csm_Roughness = clamp(roughnessBase - highBoost * 0.5, 0.0, 1.0);
}