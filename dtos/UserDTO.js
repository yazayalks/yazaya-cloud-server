export default class UserDTO {
    email;
    id;
    isActivated;
    activationLink;
    firstName;
    lastName;

    constructor(model) {
        this.email = model.email;
        this.id = model._id;
        this.firstName = model.firstName;
        this.lastName = model.lastName;
        this.isActivated = model.isActivated;
        this.diskSpace = model.diskSpace;
        this.usedSpace = model.usedSpace;
        this.avatar = model.avatar;
        this.files = model.files;
        this.activationLink = model.activationLink;
    }
}

