import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useState } from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';
import { validateCPF } from '../../utils/validateCpf';
import { maskCep, maskCpf } from '../../utils/maks';

const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  surname: z.string().min(1, 'Sobrenome é obrigatório'),
  cpf: z
    .string()
    .min(14, 'CPF inválido')
    .refine((cpf) => validateCPF(cpf), { message: 'CPF inválido' }),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  sex: z.enum(['Masculino', 'Feminino', 'Outro'], {
    required_error: 'Selecione um sexo',
  }),
  birthDate: z.date({ required_error: 'Data de nascimento obrigatória' }),
  cep: z.string().min(9, 'CEP inválido'),
  city: z.string(),
  state: z.string(),
  street: z.string(),
  neighborhood: z.string(),
  complement: z.string(),
});

type FormValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const [loadingCep, setLoadingCep] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      surname: '',
      cpf: '',
      email: '',
      password: '',
      sex: 'Masculino',
      birthDate: new Date(),
      cep: '',
      city: '',
      state: '',
      street: '',
      neighborhood: '',
      complement: '',
    },
  });

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const res = await axios.get(
          `https://viacep.com.br/ws/${cleanCep}/json`,
        );
        const data = res.data;
        setValue('city', data.localidade);
        setValue('state', data.uf);
        setValue('street', data.logradouro);
        setValue('neighborhood', data.bairro);
        setValue('complement', data.complemento);
      } catch (err) {
        console.error('Erro ao buscar CEP', err);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await axios.post(
        'https://6256fc506ea7037005434e84.mockapi.io/api/v1/user',
        data,
      );
      console.log('Usuário registrado com sucesso:', response.data);
      // redirecionar pro login ou mostrar mensagem
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
    }
  };

  return (
    <Box maxWidth="md" mx="auto" p={4}>
      <Typography variant="h4" gutterBottom>
        Cadastro de Usuário
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          {/* Dados Pessoais */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nome"
              fullWidth
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Sobrenome"
              fullWidth
              {...register('surname')}
              error={!!errors.surname}
              helperText={errors.surname?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="CPF"
              fullWidth
              {...register('cpf')}
              value={maskCpf(watch('cpf'))}
              onChange={(e) => setValue('cpf', e.target.value)}
              error={!!errors.cpf}
              helperText={errors.cpf?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
              fullWidth
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Senha"
              type="password"
              fullWidth
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Sexo"
              fullWidth
              {...register('sex')}
              error={!!errors.sex}
              helperText={errors.sex?.message}
            >
              <MenuItem value="Masculino">Masculino</MenuItem>
              <MenuItem value="Feminino">Feminino</MenuItem>
              <MenuItem value="Outro">Outro</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="birthDate"
              control={control}
              render={({ field }) => (
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={ptBR}
                >
                  <DatePicker
                    label="Data de Nascimento"
                    value={field.value}
                    onChange={(date) => field.onChange(date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.birthDate,
                        helperText: errors.birthDate?.message,
                      },
                    }}
                  />
                </LocalizationProvider>
              )}
            />
          </Grid>

          {/* Endereço */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="CEP"
              fullWidth
              {...register('cep')}
              value={maskCep(watch('cep'))}
              onChange={(e) => {
                const value = e.target.value;
                setValue('cep', value);
                handleCepChange(value);
              }}
              error={!!errors.cep}
              helperText={errors.cep?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Cidade"
              fullWidth
              {...register('city')}
              error={!!errors.city}
              helperText={errors.city?.message}
              disabled={loadingCep}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Estado"
              fullWidth
              {...register('state')}
              error={!!errors.state}
              helperText={errors.state?.message}
              disabled={loadingCep}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Logradouro"
              fullWidth
              {...register('street')}
              error={!!errors.street}
              helperText={errors.street?.message}
              disabled={loadingCep}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Bairro"
              fullWidth
              {...register('neighborhood')}
              error={!!errors.neighborhood}
              helperText={errors.neighborhood?.message}
              disabled={loadingCep}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Complemento"
              fullWidth
              {...register('complement')}
              error={!!errors.complement}
              helperText={errors.complement?.message}
            />
          </Grid>

          {/* Botão */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Registrar
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default RegisterForm;
