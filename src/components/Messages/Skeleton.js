import React from "react";

function Skeleton({ className }) {
  return (
    <div className={`Skeleton ${className}`}>
      <div className="Skeleton__avatar" />
      <div className="Skeleton-details">
        <div className="Skeleton-details__text" />
        <div className="Skeleton-details__text shorter-text" />
      </div>
    </div>
  );
}

export default Skeleton;
