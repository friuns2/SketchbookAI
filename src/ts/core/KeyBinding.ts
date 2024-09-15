export class KeyBinding
{
	public eventCodes: string[];
	public isPressed: boolean = false;
	public justPressed: boolean = false;
	public justReleased: boolean = false;
	public description: string;

	public static CreateKeyBinding(code: string, description: string = "")
	{		
		return new KeyBinding(code, description);
	}
	public static CreateMouseBinding(code: number, description: string = "")
	{
		return new KeyBinding("mouse" + code, description);
	}

	constructor(code: string, description: string = "")
	{
		this.eventCodes = [code.replace("MouseRight", "mouse2").replace("MouseLeft", "mouse0").replace("Mouse", "mouse")];
		this.description = description; // Set description from parameter
	}
}