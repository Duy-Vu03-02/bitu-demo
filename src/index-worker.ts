import { Application } from '@worker/application';

Application.createApplication().then(() => {
    console.log('The worker was started successfully!');
});
