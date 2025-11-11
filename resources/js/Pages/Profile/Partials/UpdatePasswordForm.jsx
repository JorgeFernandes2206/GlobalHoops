import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) { reset('password', 'password_confirmation'); passwordInput.current.focus(); }
                if (errors.current_password) { reset('current_password'); currentPasswordInput.current.focus(); }
            },
        });
    };

    return (
        <section className={className}>
            <form onSubmit={updatePassword} className="space-y-6">
                <div>
                    <InputLabel htmlFor="current_password" value="Current Password" className="text-gray-300" />
                    <TextInput id="current_password" ref={currentPasswordInput} value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} type="password" className="mt-2 block w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500" autoComplete="current-password" />
                    <InputError message={errors.current_password} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="password" value="New Password" className="text-gray-300" />
                    <TextInput id="password" ref={passwordInput} value={data.password} onChange={(e) => setData('password', e.target.value)} type="password" className="mt-2 block w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500" autoComplete="new-password" />
                    <InputError message={errors.password} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-gray-300" />
                    <TextInput id="password_confirmation" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} type="password" className="mt-2 block w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500" autoComplete="new-password" />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>
                <div className="flex items-center gap-4">
                    <button type="submit" disabled={processing} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100">{processing ? 'Saving...' : 'Save Changes'}</button>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0"><p className="text-sm text-green-400 flex items-center gap-2"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>Saved!</p></Transition>
                </div>
            </form>
        </section>
    );
}
