import { Application } from '@api/application';

Application.createApplication().then(() => {
    console.log("'The api was started successfully!'");
});
