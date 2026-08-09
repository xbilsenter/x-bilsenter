export const CAR_SPEC_ORDER = [
  'make',
  'model',
  'year',
  'mileage',
  'fuel',
  'transmission',
  'effect',
  'wheel_drive',
  'first_registration',
  'body_type',
  'exterior_color',
  'interior_color',
  'seats',
  'weight',
  'registration_class',
  'chassis_number'
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
