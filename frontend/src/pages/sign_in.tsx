import { Container, Button, TextField, Box } from "@mui/material";
import Grid from '@mui/material/Grid';
import { useForm, type SubmitHandler } from 'react-hook-form';
import '../App.css';

type FormValue = {
    username: string;
};

const Loginform = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<FormValue>();

    const onSubmit: SubmitHandler<FormValue> = (data) => {
        console.log("final data", data);
        alert(data.username);
    };

    return (
        <div className="bg-color">
            <Container fixed>
                <div className="form-wrapper">
                    <Grid container justifyContent="center">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Box component="span" sx={{ p: 1, color: '#1d395d', textAlign: 'center' }}>
                                <h1>Login</h1>
                            </Box>
                            <Box>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    placeholder="Enter Username"
                                    {...register("username", {
                                        required: "Username is required",
                                        minLength: {
                                            value: 3,
                                            message: "Username must be at least 3 characters",
                                        }
                                    })}
                                />
                                {errors.username && (
                                    <p className='error-msg'>{errors.username.message}</p>
                                )}

                                <Button
                                    style={{ marginTop: '20px' }}
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                >
                                    Submit
                                </Button>
                            </Box>
                        </form>

                    </Grid>
                </div>
            </Container>
        </div>
    );
};

export default Loginform;
