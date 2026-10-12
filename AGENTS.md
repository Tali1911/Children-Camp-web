# Architecture rules

- Camp registration loading uses a shared status component and request-scoped progress hook; completion is reported only after registrations and required attendance data finish, so partial totals are never labelled complete.