"""Compile/link production WebGL shaders with native GLES; no browser or images."""
import ctypes as c
import ctypes.util
import json
import os
import sys

os.environ.setdefault('LIBGL_ALWAYS_SOFTWARE', '1')
egl_name, gl_name = ctypes.util.find_library('EGL'), ctypes.util.find_library('GLESv2')
if not egl_name or not gl_name:
    raise RuntimeError('Native shader validation needs libEGL and libGLESv2')
egl, gl = c.CDLL(egl_name), c.CDLL(gl_name)

def bind(library, name, result, arguments):
    fn = getattr(library, name)
    fn.restype, fn.argtypes = result, arguments
    return fn

pointer, integer, unsigned = c.c_void_p, c.c_int, c.c_uint
get_proc = bind(egl, 'eglGetProcAddress', pointer, [c.c_char_p])
get_display = bind(egl, 'eglGetDisplay', pointer, [pointer])
initialize = bind(egl, 'eglInitialize', unsigned, [pointer, c.POINTER(integer), c.POINTER(integer)])
choose_config = bind(egl, 'eglChooseConfig', unsigned, [pointer, c.POINTER(integer), c.POINTER(pointer), integer, c.POINTER(integer)])
bind_api = bind(egl, 'eglBindAPI', unsigned, [unsigned])
create_surface = bind(egl, 'eglCreatePbufferSurface', pointer, [pointer, pointer, c.POINTER(integer)])
create_context = bind(egl, 'eglCreateContext', pointer, [pointer, pointer, pointer, c.POINTER(integer)])
make_current = bind(egl, 'eglMakeCurrent', unsigned, [pointer, pointer, pointer, pointer])
destroy_context = bind(egl, 'eglDestroyContext', unsigned, [pointer, pointer])
destroy_surface = bind(egl, 'eglDestroySurface', unsigned, [pointer, pointer])
terminate = bind(egl, 'eglTerminate', unsigned, [pointer])

platform = get_proc(b'eglGetPlatformDisplayEXT')
display = c.CFUNCTYPE(pointer, unsigned, pointer, c.POINTER(integer))(platform)(0x31DD, None, None) if platform else get_display(None)
major, minor = integer(), integer()
if not initialize(display, c.byref(major), c.byref(minor)):
    raise RuntimeError('Could not initialize a surfaceless native EGL display')
surface, context = None, None
try:
    config, count = pointer(), integer()
    attributes = (integer * 13)(0x3033, 1, 0x3040, 4, 0x3024, 8, 0x3023, 8, 0x3022, 8, 0x3021, 8, 0x3038)
    if not choose_config(display, attributes, c.byref(config), 1, c.byref(count)) or count.value != 1:
        raise RuntimeError('No GLES2 pbuffer configuration')
    if not bind_api(0x30A0):
        raise RuntimeError('Could not bind GLES')
    surface = create_surface(display, config, (integer * 5)(0x3057, 16, 0x3056, 16, 0x3038))
    context = create_context(display, config, None, (integer * 3)(0x3098, 2, 0x3038))
    if not surface or not context or not make_current(display, surface, surface, context):
        raise RuntimeError('Could not create a native GLES shader context')

    create_shader = bind(gl, 'glCreateShader', unsigned, [unsigned])
    shader_source = bind(gl, 'glShaderSource', None, [unsigned, integer, c.POINTER(c.c_char_p), c.POINTER(integer)])
    compile_shader = bind(gl, 'glCompileShader', None, [unsigned])
    shader_status = bind(gl, 'glGetShaderiv', None, [unsigned, unsigned, c.POINTER(integer)])
    shader_log = bind(gl, 'glGetShaderInfoLog', None, [unsigned, integer, c.POINTER(integer), pointer])
    delete_shader = bind(gl, 'glDeleteShader', None, [unsigned])
    create_program = bind(gl, 'glCreateProgram', unsigned, [])
    attach_shader = bind(gl, 'glAttachShader', None, [unsigned, unsigned])
    link_program = bind(gl, 'glLinkProgram', None, [unsigned])
    program_status = bind(gl, 'glGetProgramiv', None, [unsigned, unsigned, c.POINTER(integer)])
    program_log = bind(gl, 'glGetProgramInfoLog', None, [unsigned, integer, c.POINTER(integer), pointer])
    delete_program = bind(gl, 'glDeleteProgram', None, [unsigned])
    get_string = bind(gl, 'glGetString', c.c_char_p, [unsigned])

    def validate_status(handle, query, status_key, get_log, label):
        status = integer()
        query(handle, status_key, c.byref(status))
        if not status.value:
            buffer = c.create_string_buffer(4096)
            get_log(handle, len(buffer), None, buffer)
            raise RuntimeError(label + ': ' + buffer.value.decode('utf-8', 'replace'))

    programs = json.load(sys.stdin)['programs']
    if not programs:
        raise RuntimeError('No production shader programs were captured')
    for index, pair in enumerate(programs):
        shaders, program = [], None
        try:
            for key, kind in (('vertex', 0x8B31), ('fragment', 0x8B30)):
                shader = create_shader(kind)
                shaders.append(shader)
                source = pair[key].encode('utf-8')
                text, length = c.c_char_p(source), integer(len(source))
                shader_source(shader, 1, c.byref(text), c.byref(length))
                compile_shader(shader)
                validate_status(shader, shader_status, 0x8B81, shader_log, f'Program {index} {key}')
            program = create_program()
            for shader in shaders:
                attach_shader(program, shader)
            link_program(program)
            validate_status(program, program_status, 0x8B82, program_log, f'Program {index} link')
        finally:
            if program:
                delete_program(program)
            for shader in shaders:
                delete_shader(shader)
    print(json.dumps({'native_shader_programs': len(programs), 'compilation': 'passed', 'linking': 'passed',
                      'renderer': get_string(0x1F01).decode('utf-8', 'replace')}))
finally:
    make_current(display, None, None, None)
    if context:
        destroy_context(display, context)
    if surface:
        destroy_surface(display, surface)
    terminate(display)
