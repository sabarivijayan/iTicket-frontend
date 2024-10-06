"use client"; // Ensure this is treated as a Client Component

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/index"; // Import the correct RootState
import { adminActions, userActions } from "../store/index"; // Import actions

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch(); // Now this is safely used inside the Provider

  useEffect(() => {
    if (localStorage.getItem("userId")) {
      dispatch(userActions.login());
    } else if (localStorage.getItem("adminId")) {
      dispatch(adminActions.login());
    }
  }, [dispatch]);

  const isAdminLoggedIn = useSelector(
    (state: RootState) => state.auth.isLoggedIn
  );
  const isUserLoggedIn = useSelector(
    (state: RootState) => state.user.isLoggedIn
  );

  console.log("isAdminLoggedIn", isAdminLoggedIn);
  console.log("isUserLoggedIn", isUserLoggedIn);

  return <>{children}</>;
}
