import { default as axios } from "axios";

// only public apis needed to find slots

const config = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
  },
};

export const getAllStates = async () => {
  const { data } = await axios.get(
    "https://cdn-api.co-vin.in/api/v2/admin/location/states",
    config
  );

  return data.states;
};

export const getAllDistrictInState = async (stateId) => {
  const { data } = await axios.get(
    `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`,
    config
  );

  return data.districts;
};

export const getSessionsByDistrict = async (districtId, date) => {
  const { data } = await axios.get(
    `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${date}`,
    config
  );

  const slots = [];

  for (const center of data.centers) {
    for (const session of center.sessions) {
      if (session.min_age_limit === 18 && session.available_capacity > 0) {
        slots.push({
          name: center.name,
          address: center.address,
          fee: center.fee_type,
          vaccine: session.vaccine,
          capacity: session.available_capacity,
          date: session.date,
          age: session.min_age_limit,
          slots: session.slots,
        });
      }
    }
  }

  return slots;
};
