import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";

import "./PhoneNumberInput.css";
import "react-phone-input-2/lib/style.css";

const PhoneNumberInput = ({ name, phoneNumber, onChange }) => {
  return (
    <div>
      <PhoneInput
        country={"rs"}
        value={phoneNumber}
        inputProps={{
          id: "register-shop-phone",
          name: name,
          placeholder: "+381",
          autoComplete: "tel",
          required: true,
        }}
        onChange={(phoneNumber) =>
          onChange({ target: { name, value: phoneNumber } })
        }
      />
    </div>
  );
};

export default PhoneNumberInput;
