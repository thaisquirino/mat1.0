export type RegisterFormData = {
  name: string;
  surname: string;
  cpf: string;
  email: string;
  password: string;
  sex: 'Masculino' | 'Feminino' | 'Outro';
  birthDate: Date;
  cep: string;
  city: string;
  state: string;
  street: string;
  neighborhood: string;
  complement: string;
};
