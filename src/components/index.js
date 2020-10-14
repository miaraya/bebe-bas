import React from "react";
import { Avatar } from "antd";
export const StaffList = ({ record }) => {
  return (
    <div
      style={{
        display: "flex",
      }}
    >
      {record.staff_ids && record.staff_ids.length
        ? record.staff_ids.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                marginRight: 10,
              }}
            >
              <Avatar src={s.staff.image} />
              <span>{s.staff.name}</span>
            </div>
          ))
        : "NO STAFF"}
    </div>
  );
};

export const fabric_thumbnail =
  "https://apibas.herokuapp.com/api/containers/bebe-fabrics-thumbnails/download/";
export const fabric_image =
  "https://apibas.herokuapp.com/api/containers/bebe-fabrics/download/";
export const item_image =
  "https://apibas.herokuapp.com/api/containers/bebe-order-images/download/";
