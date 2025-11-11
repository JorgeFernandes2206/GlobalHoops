import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" className="text-gray-300" />
                    <TextInput id="name" className="mt-2 block w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500" value={data.name} onChange={(e) => setData('name', e.target.value)} required isFocused autoComplete="name" />
                    <InputError className="mt-2" message={errors.name} />
                </div>
                <div>
                    <InputLabel htmlFor="email" value="Email" className="text-gray-300" />
                    <TextInput id="email" type="email" className="mt-2 block w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500" value={data.email} onChange={(e) => setData('email', e.target.value)} required autoComplete="username" />
                    <InputError className="mt-2" message={errors.email} />
                </div>
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                        <p className="text-sm text-yellow-200">Your email address is unverified. <Link href={route('verification.send')} method="post" as="button" className="ml-2 text-yellow-400 underline hover:text-yellow-300 font-semibold">Click here to re-send the verification email.</Link></p>
                        {status === 'verification-link-sent' && (<div className="mt-2 text-sm font-medium text-green-400"> A new verification link has been sent.</div>)}
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <button type="submit" disabled={processing} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100">{processing ? 'Saving...' : 'Save Changes'}</button>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0"><p className="text-sm text-green-400 flex items-center gap-2"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>Saved!</p></Transition>
                </div>
            </form>
        </section>
    );
}
