import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const supabaseUrl = 'https://recfwdfofglgseqxkobw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlY2Z3ZGZvZmdsZ3NlcXhrb2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3ODQwODQsImV4cCI6MjA2MDM2MDA4NH0.JucMRw5uJ1MoiZZJNFZjQOL3MtnRctdLZ1U5qOPsBd0'; // Replace with your real anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('activityForm');
const result = document.getElementById('result');

const activityTypeEl = document.getElementById('activity_type');
const activityDetailEl = document.getElementById('activity_detail');
const carbonOutputEl = document.getElementById('carbon_output');

// Emission factors (sample values)
const emissionFactors = {
  Travel: {
    Car: 0.21,
    Bike: 0.05,
    Bus: 0.11,
    Train: 0.04,
    Flight: 0.25
  },
  Food: {
    Mutton: 27,
    Chicken: 6.9,
    Rice: 2.7,
    Vegetables: 2,
    milk : 1.3
  },
  Shopping: {
    Clothes: 20,
    Electronics: 50,
    Others: 10
  },
  Electricity: {
    Unit: 0.9
  }
};

let rawCarbonValue = 0; // For storing the numeric value

function calculateCarbonOutput() {
  const type = activityTypeEl.value;
  const detail = activityDetailEl.value;

  if (!type || !detail.includes('-')) {
    carbonOutputEl.value = '';
    rawCarbonValue = 0;
    return;
  }

  const [subTypeRaw, quantityRaw] = detail.split('-').map(s => s.trim());
  const quantity = parseFloat(quantityRaw);
  const subType = subTypeRaw;

  if (!isNaN(quantity) && emissionFactors[type] && emissionFactors[type][subType]) {
    rawCarbonValue = quantity * emissionFactors[type][subType];
    const formatted = rawCarbonValue < 1
      ? `${(rawCarbonValue * 1000).toFixed(0)} grams CO₂`
      : `${rawCarbonValue.toFixed(2)} kg CO₂`;
    carbonOutputEl.value = formatted;
  } else {
    carbonOutputEl.value = '';
    rawCarbonValue = 0;
  }
}

activityTypeEl.addEventListener('change', calculateCarbonOutput);
activityDetailEl.addEventListener('input', calculateCarbonOutput);

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const user_email = document.getElementById('email').value;
  const day_type = document.getElementById('day_type').value;
  const activity_type = activityTypeEl.value;
  const activity_detail = activityDetailEl.value;

  const { data, error } = await supabase
    .from('carbon_activities')
    .insert([
      {
        user_email,
        day_type,
        activity_type,
        activity_detail,
        carbon_output: rawCarbonValue
      }
    ]);

  if (error) {
    console.error(error);
    result.textContent = 'Error submitting data.';
  } else {
    result.textContent = 'Activity logged successfully!';
    form.reset();
    rawCarbonValue = 0;
  }
});

