export const CAR_SPEC_ORDER = [
  'year',
  'mileage',
  'transmission',
  'fuel',
  'wheel_drive',
  'engine_displacement',
  'weight',
  'effect',
  'co2_emission',
  'seats',
  'doors',
  'owners',
  'body_type',
  'exterior_color',
  'interior_color',
  'make',
  'model',
  'chassis_number',
  'first_registration',
  'exterior_color_description',
  'registration_class'
];

const ORDER_INDEX = Object.fromEntries(
  CAR_SPEC_ORDER.map(function (key, index) { return [key, index]; })
);

export function sortCarSpecs(specs) {
  return (Array.isArray(specs) ? specs : []).slice().sort(function (a, b) {
    const ai = ORDER_INDEX[a?.key];
    const bi = ORDER_INDEX[b?.key];
    if (ai == null && bi == null) return 0;
    if (ai == null) return 1;
    if (bi == null) return -1;
    return ai - bi;
  });
}
