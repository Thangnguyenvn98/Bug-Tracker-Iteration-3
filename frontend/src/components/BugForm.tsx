import Navbar from './Navbar'
import { useForm, SubmitHandler } from 'react-hook-form'
import { BugFormData } from '../types/bugForm'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../hooks/store'
import { AxiosError } from 'axios'

const BugForm = () => {
  const {register ,handleSubmit, formState: { errors }} = useForm<BugFormData>()
  const navigate = useNavigate()
  const { reportBug: storeReportBug } = useAuthStore();

  const onSubmit: SubmitHandler<BugFormData> = async (data) => {
    try {
        await storeReportBug(data);
        navigate('/');  // Redirect to home or another page as needed
        toast.success("Bug reported successfully");
    } catch (e) {
        const errorMessage = e instanceof AxiosError ? e.response?.data.message : 'Bug reporting failed';
        toast.error(errorMessage);
        console.error('Bug reporting failed:', e);
    }
};
  return (
    <div className="p-4">
            <h1 className="text-2xl font-bold text-center">Bug Report Form</h1>
            <div className="flex justify-center gap-x-10 mt-10">
                <div className="bg-blue-500 p-4">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-y-4">
                            <div className="flex gap-x-[4.5rem]">
                                <label>Report #:</label>
                                <input {...register('number', { required: true })} type="number" className="border-2 border-slate-400" />
                                {errors.number && <span className="text-red-500">Report number is required</span>}
                            </div>
                            <div className="flex gap-x-[3.1rem]">
                                <label>Type of Bug:</label>
                                <input {...register('type', { required: true })} type="text" className="border-2 border-slate-400" />
                                {errors.type && <span className="text-red-500">Type of bug is required</span>}
                            </div>
                            <div className="flex gap-x-4">
                                <label>Summary of Bug:</label>
                                <textarea {...register('summary', { required: true })} rows={8} cols={30} className="border-2 border-slate-400"></textarea>
                                {errors.summary && <span className="text-red-500">Summary is required</span>}
                            </div>
                            <div className="flex gap-x-8">
                                <label>Notify me about:</label>
                                <div className="flex flex-col">
                                    <div>
                                        <input type="checkbox" {...register('progress')} />
                                        <label> Progress on this bug</label>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="bg-white text-blue-500 font-bold py-2 px-4 rounded">Submit Bug</button>
                        </div>
                    </form>
                </div>
                <div className="p-2">
                    <Navbar/>
                </div>
            </div>
        </div>
    );
}

export default BugForm