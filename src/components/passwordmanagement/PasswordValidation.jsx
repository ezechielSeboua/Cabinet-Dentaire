function Validation(values) {
  let error = {};
  const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;

  if (
    values.repeatPassword === "" ||
    String(values.repeatPassword) !== String(values.password)
  ) {
    console.log(values.repeatPassword + "___" + values.password);
    error.repeatPassword = "Password not matched";
  }

  return error;
}

export default Validation;
